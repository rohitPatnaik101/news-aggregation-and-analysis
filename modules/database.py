import logging
from pymongo import MongoClient
from bson import ObjectId

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDBHandler:
    def __init__(self, uri, database_name):
        """Initialize MongoDB client and database."""
        try:
            self.client = MongoClient(uri)
            self.db = self.client[database_name]
            self.news_collection = self.db["news"]
            logger.info("MongoDB connection established")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    def save_news(self, article):
        """Save a news article to the database."""
        try:
            # Check if article already exists based on title and timestamp
            existing = self.news_collection.find_one({"title": article["title"], "timestamp": article["timestamp"]})
            if not existing:
                self.news_collection.insert_one(article)
                logger.info(f"Saved news: {article['title']}")
            else:
                logger.info(f"News already exists: {article['title']}")
        except Exception as e:
            logger.error(f"Error saving news: {e}")

    def get_news(self):
        """Retrieve all news articles from the database."""
        try:
            news = list(self.news_collection.find())
            # Convert ObjectId to string for JSON serialization
            for article in news:
                article["_id"] = str(article["_id"])
            return news
        except Exception as e:
            logger.error(f"Error retrieving news: {e}")
            return []