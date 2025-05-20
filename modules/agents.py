import logging
from langchain_together import Together
from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from cachetools import TTLCache
from modules.tools import get_tools
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from transformers import pipeline
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RateLimitError(Exception):
    """Custom exception for Together AI rate limit errors."""
    pass

class FinancialAgents:
    def __init__(self, together_api_key, newsapi_key):
        self.llm = Together(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            together_api_key=together_api_key,
            max_tokens=1000
        )
        self.tools = get_tools(newsapi_key)
        self.sentiment_cache = TTLCache(maxsize=1000, ttl=86400)
        self.prompt_template = PromptTemplate(
            input_variables=["input", "tools", "tool_names", "agent_scratchpad"],
            template="""You are a financial analyst agent. Your task is to {input}. Use the provided tools to fetch data and return results in JSON format.

Available tools: {tool_names}

Tool descriptions:
{tools}

Agent Scratchpad: {agent_scratchpad}

Follow this process:
1. Understand the task.
2. Select the appropriate tool (e.g., ScrapeNews, FetchNewsAPI).
3. Call the tool with the correct input.
4. Return the tool's output in JSON format.

Example output for news:
```json
[
  {"title": "Article 1", "text": "Content", "source": "Source", "timestamp": "ISO_date"},
  {"title": "Article 2", "text": "Content", "source": "Source", "timestamp": "ISO_date"}
]
```

If no data is found or an error occurs, return an empty list `[]`.

Respond only with the JSON output. If you need to think, include thoughts in the scratchpad, not the final response."""
        )

    def create_news_agent(self):
        """Create news aggregation agent."""
        agent = create_react_agent(self.llm, self.tools, self.prompt_template)
        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            max_iterations=3,
            handle_parsing_errors=True
        )

    def create_sentiment_agent(self):
        """Create sentiment analysis agent using FinBERT."""
        classifier = pipeline("sentiment-analysis", model="ProsusAI/finbert")
        
        def analyze_sentiment(text):
            if not text:
                return {"label": "neutral", "score": 0.0}
            if text in self.sentiment_cache:
                logger.info("Returning cached sentiment")
                return self.sentiment_cache[text]
            try:
                result = classifier(text[:512])[0]  # FinBERT max length
                label = result["label"].lower()
                score = result["score"]
                sentiment = {"label": label, "score": score}
                self.sentiment_cache[text] = sentiment
                logger.info(f"Computed sentiment: {sentiment}")
                return sentiment
            except Exception as e:
                logger.error(f"Sentiment analysis failed: {e}")
                return {"label": "neutral", "score": 0.0}
        
        return analyze_sentiment

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_fixed(2),
        retry=retry_if_exception_type(RateLimitError)
    )
    def run_agent(self, agent, input_str, fallback_tool=None):
        """Run an agent with rate limit handling and fallback."""
        try:
            output = agent.invoke({"input": input_str})
            logger.debug(f"Agent output: {output}")
            result = json.loads(output["output"]) if isinstance(output["output"], str) else output["output"]
            return result
        except Exception as e:
            if "Request was rejected due to request rate limiting" in str(e):
                raise RateLimitError("Together AI rate limit exceeded")
            logger.error(f"Agent failed: {e}")
            if fallback_tool:
                logger.info(f"Falling back to direct tool call: {fallback_tool.name}")
                return fallback_tool.func(input_str.split("for ")[-1])
            return []

    def orchestrate(self, queries):
        """Orchestrate agents to process queries."""
        news_agent = self.create_news_agent()
        sentiment_agent = self.create_sentiment_agent()
        
        results = {"articles": []}
        
        # News aggregation
        for query in queries:
            try:
                news_input = f"Fetch financial news for {query}."
                articles = self.run_agent(
                    news_agent,
                    news_input,
                    fallback_tool=self.tools[1]  # FetchNewsAPI
                )
                for article in articles:
                    if article and "text" in article:
                        sentiment = sentiment_agent(article["text"])
                        article["sentiment"] = sentiment
                        results["articles"].append(article)
            except RateLimitError:
                logger.warning(f"Rate limit hit for news query: {query}. Falling back to FetchNewsAPI.")
                articles = self.tools[1].func(query)
                for article in articles:
                    if article and "text" in article:
                        sentiment = sentiment_agent(article["text"])
                        article["sentiment"] = sentiment
                        results["articles"].append(article)
            except Exception as e:
                logger.error(f"News agent failed for {query}: {e}")

        logger.info(f"Orchestration results: {len(results['articles'])} articles")
        return results

class GeneralAgent:
    def __init__(self, together_api_key):
        self.llm = Together(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            together_api_key=together_api_key,
            max_tokens=1000
        )
        self.prompt_template = PromptTemplate(
            input_variables=["input"],
            template="""You are a helpful general knowledge assistant. Answer the following query to the best of your knowledge in a concise and informative manner:

Query: {input}

Provide a direct answer without any additional formatting or examples unless necessary."""
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_fixed(2),
        retry=retry_if_exception_type(RateLimitError)
    )
    def answer_query(self, query):
        """Answer a general query using the LLM."""
        try:
            prompt = self.prompt_template.format(input=query)
            response = self.llm(prompt)
            logger.info(f"General agent response for query '{query}': {response}")
            return response
        except Exception as e:
            if "Request was rejected due to request rate limiting" in str(e):
                raise RateLimitError("Together AI rate limit exceeded")
            logger.error(f"General agent failed for query '{query}': {e}")
            return "I'm sorry, I couldn't process your query at this time."