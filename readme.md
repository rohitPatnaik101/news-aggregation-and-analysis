### Financial News Analyst Agent
Project Description
Problem Statement
In today’s fast-paced financial world, staying updated with market trends and news is crucial for investors and analysts. However, manually sifting through vast amounts of financial news to gauge market sentiment and trends is time-consuming and prone to human bias. Additionally, users may have general queries unrelated to financial news, which a specialized financial tool might not address effectively. There’s a need for an automated system that can:

Aggregate financial news and analyze its sentiment.
Provide a market overview with actionable recommendations.
Handle both financial and general queries seamlessly.

Solution
The Financial News Analyst Agent is a Python-based AI system that leverages multiple agents to aggregate financial news, perform sentiment analysis, and provide market insights. Built with LangChain, FastAPI, Streamlit, and MongoDB Atlas, it offers:

A market overview based on the sentiment of recent news articles.
Detailed sentiment analysis for user-specified queries (e.g., “Apple stock”).
A fallback mechanism to answer general queries (e.g., “How to bake a cake”) using a general-purpose agent.The system ensures reliability by handling API failures, database serialization, and diverse user inputs, making it a versatile tool for financial analysis and beyond.

Possible Challenges

API Reliability: NewsAPI and Together AI may face rate limits or downtime, affecting news fetching and LLM responses.
Sentiment Accuracy: FinBERT’s sentiment analysis may misclassify nuanced financial texts.
Query Relevance: Filtering news for user queries requires robust matching to avoid missing relevant articles.
Scalability: Handling a large number of news articles and user queries efficiently.
General Query Handling: Ensuring the general agent provides accurate and concise answers for non-financial queries.

Methodology
The project follows a modular approach, integrating AI agents, web APIs, and a user-friendly interface:

News Aggregation:

Use NewsAPI to fetch financial news articles based on user queries.
Implement a fallback scraping tool using BeautifulSoup to handle API failures.
Store articles in MongoDB Atlas for persistence.


Sentiment Analysis:

Utilize FinBERT (via HuggingFace Transformers) to analyze the sentiment of news articles (positive, negative, neutral).
Cache sentiment results using cachetools to improve performance.


Market Overview:

Compute sentiment ratios (positive, negative, neutral) from recent news articles.
Determine the market trend (bullish, bearish, neutral) and provide recommendations.


Query Handling:

Process user queries with a financial news agent to fetch and analyze relevant news.
If no news is found, fall back to a general-purpose agent for a direct answer.


User Interface:

Build an interactive UI with Streamlit to display market overviews, news analysis, and general responses.
Use FastAPI to serve backend endpoints for news fetching and query processing.



Workflow and Architecture
Workflow

User Interaction:

The user accesses the Streamlit UI at http://localhost:8501.
On page load, the system fetches recent news from MongoDB and displays a Market Overview and Recent News section.
The user inputs a query (e.g., “Apple stock” or “How to bake a cake”) and clicks “Analyze.”


News Processing:

The query is sent to the FastAPI backend (/process endpoint).
The FinancialAgents class orchestrates news fetching using NewsAPI or a scraping tool.
Articles are analyzed for sentiment using FinBERT and saved to MongoDB.


Analysis Display:

If news is found, the UI displays a sentiment summary in bullet points and a table of relevant articles.
If no news is found, the system notifies the user and invokes the GeneralAgent via the /general_query endpoint to provide a general answer.


Market Overview:

Sentiment ratios are computed from the Recent News data and used to determine the market trend and recommendation.



Architecture
+-------------------+         +-------------------+         +-------------------+
|   Streamlit UI    | <-----> |   FastAPI Server  | <-----> |   MongoDB Atlas   |
| - Market Overview |         | - /process        |         | - News Collection |
| - Recent News     |         | - /news           |         |                   |
| - Query Analysis  |         | - /general_query  |         |                   |
+-------------------+         +-------------------+         +-------------------+
                            |
                            |
                            v
+-------------------+         +-------------------+         +-------------------+
| Financial Agents  |         |   General Agent   |         |    NewsAPI        |
| - News Aggregation|         | - General Queries |         | - Fetch News      |
| - Sentiment Analysis |      | - Together LLM   |         |                   |
+-------------------+         +-------------------+         +-------------------+


Streamlit UI: Displays market insights, news, and query responses.
FastAPI Server: Handles API requests for news processing and general queries.
MongoDB Atlas: Stores news articles with sentiment data.
Financial Agents: Aggregates news and performs sentiment analysis using FinBERT.
General Agent: Answers non-news-related queries using the Together LLM.
NewsAPI: Primary source for fetching financial news articles.

Features

Market Insights: Displays a market overview with sentiment ratios, trend (bullish, bearish, neutral), and recommendations based on recent news.
Query-Specific Analysis: Analyzes user queries (e.g., “Apple stock”) and provides a sentiment summary in bullet points, along with a table of relevant news articles.
Flexible Query Handling: Processes any user query, falling back to a general agent if no news is found.
Sentiment Analysis: Uses FinBERT to classify news sentiment as positive, negative, or neutral.
Persistent Storage: Saves news articles in MongoDB Atlas for reliable access.
Interactive UI: Built with Streamlit for an intuitive user experience.

Details of All Agents Used

FinancialAgents:

Purpose: Handles news aggregation and sentiment analysis.
Components:
News Agent: Uses LangChain with Together’s Mixtral LLM to select tools (ScrapeNews, FetchNewsAPI) for news fetching.
Sentiment Agent: Uses FinBERT (via HuggingFace Transformers) to classify article sentiment.


Tools:
ScrapeNews: Scrapes news from Google News using BeautifulSoup.
FetchNewsAPI: Fetches news via NewsAPI.


Implementation: modules/agents.py


GeneralAgent:

Purpose: Answers general queries not related to news (e.g., “How to bake a cake”).
Components:
Uses Together’s Mixtral LLM with a simple prompt template.
No tools; directly generates responses.


Implementation: modules/agents.py



Fallbacks

News Fetching Fallback:

If NewsAPI fails (e.g., rate limit exceeded), the ScrapeNews tool scrapes news from Google News.
Retries API calls up to 3 times with a 2-second delay using tenacity.


General Query Fallback:

If no news articles match the user’s query, the system invokes the GeneralAgent to provide a general answer.
Example: For “How to bake a cake,” the system displays a message (“No recent news articles found”) and provides a general response.


Rate Limit Handling:

Both agents retry up to 3 times on Together AI rate limit errors, ensuring robustness.



Challenges Overcome

Market Overview Reliability:

Initially, the Market Overview section failed to fetch news for “financial market,” leading to an error message.
Fixed by computing sentiment ratios directly from the Recent News data, ensuring the section is always populated when news is available.


Flexible Query Handling:

Added a GeneralAgent to handle non-news-related queries, improving user experience for diverse inputs.
Enhanced the UI to seamlessly switch between news analysis and general responses.


MongoDB Integration:

Fixed an ImportError for MongoDBHandler by ensuring the correct database.py file was in place.
Handled ObjectId serialization issues by converting to strings for JSON compatibility.


API Reliability:

Implemented fallbacks for NewsAPI failures using a scraping tool.
Removed unreliable stock data fetching (via yfinance) to focus on news analysis, improving overall reliability.


Sentiment Analysis:

Used FinBERT for accurate financial sentiment classification, with caching to optimize performance.



Conclusion and Future Scope
Conclusion
The Financial News Analyst Agent successfully addresses the need for automated financial news analysis and flexible query handling. By integrating AI agents, sentiment analysis, and a user-friendly interface, it provides valuable market insights and detailed query analysis. The system’s ability to handle both financial and general queries makes it a versatile tool for users ranging from investors to casual learners.
Future Scope

Sentiment Visualization: Add charts (e.g., pie chart for sentiment distribution) to the UI for better visual insights.
Advanced Filtering: Implement fuzzy matching or NLP-based filtering to improve news relevance for user queries.
Real-Time Updates: Use WebSocket or polling to fetch and display news updates in real-time.
Multilingual Support: Extend news fetching and sentiment analysis to support multiple languages.
Custom Recommendations: Incorporate user preferences (e.g., risk tolerance) to provide personalized market recommendations.
Scalability: Optimize MongoDB indexing and caching for handling larger datasets and higher user loads.


Created by Rohit Patnaik | May 2025
