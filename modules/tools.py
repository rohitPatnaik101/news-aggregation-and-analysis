import logging
from langchain.tools import Tool
from newsapi import NewsApiClient
import requests
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_fixed
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_tools(newsapi_key):
    """Return list of tools for news data."""
    
    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def scrape_news(query):
        try:
            response = requests.get(f"https://www.google.com/search?q={query}+news&tbm=nws")
            soup = BeautifulSoup(response.text, "html.parser")
            articles = []
            for item in soup.select("div#search div.g")[:5]:
                title = item.select_one("h3").text if item.select_one("h3") else "No title"
                link = item.select_one("a")["href"] if item.select_one("a") else ""
                text = item.select_one("div").text if item.select_one("div") else ""
                articles.append({
                    "title": title,
                    "text": text,
                    "source": link,
                    "timestamp": datetime.utcnow().isoformat()
                })
            return articles
        except Exception as e:
            logger.error(f"Failed to scrape news for {query}: {e}")
            return []

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def fetch_news_api(query):
        try:
            newsapi = NewsApiClient(api_key=newsapi_key)
            articles = newsapi.get_everything(q=query, language="en", sort_by="publishedAt")["articles"][:10]
            return [
                {
                    "title": article["title"],
                    "text": article["description"] or "",
                    "source": article["url"],
                    "timestamp": article["publishedAt"]
                }
                for article in articles
            ]
        except Exception as e:
            logger.error(f"Failed to fetch news from NewsAPI for {query}: {e}")
            return []

    return [
        Tool(
            name="ScrapeNews",
            func=scrape_news,
            description="Scrapes news articles from Google News for a given query."
        ),
        Tool(
            name="FetchNewsAPI",
            func=fetch_news_api,
            description="Fetches news articles from NewsAPI for a given query."
        )
    ]