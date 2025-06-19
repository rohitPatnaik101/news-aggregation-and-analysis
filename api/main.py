import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from modules.agents import FinancialAgents, GeneralAgent
from modules.database import MongoDBHandler
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
together_api_key = os.getenv("TOGETHER_API_KEY")
newsapi_key = os.getenv("NEWSAPI_KEY")
mongo_uri = os.getenv("MONGO_URI")

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents and database
financial_agents = FinancialAgents(together_api_key, newsapi_key)
general_agent = GeneralAgent(together_api_key)
db_handler = MongoDBHandler(mongo_uri, "financial_news")

class ProcessRequest(BaseModel):
    queries: list[str]

@app.post("/process")
async def process_data(request: ProcessRequest):
    """Process queries using the financial agents."""
    try:
        results = financial_agents.orchestrate(request.queries)
        # Save results to MongoDB
        for article in results["articles"]:
            db_handler.save_news(article)
        logger.info("Processing completed successfully")
        return {"status": "success", "message": "Data processed successfully"}
    except Exception as e:
        logger.error(f"Error processing data: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/news")
async def get_news():
    """Retrieve all news articles from the database."""
    try:
        news = db_handler.get_news()
        logger.info(f"Retrieved {len(news)} news articles")
        return news
    except Exception as e:
        logger.error(f"Error retrieving news: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/general_query")
async def general_query(request: ProcessRequest):
    """Handle general queries not related to news."""
    try:
        query = request.queries[0]  # Take the first query
        response = general_agent.answer_query(query)
        return {"status": "success", "response": response}
    except Exception as e:
        logger.error(f"Error processing general query: {e}")
        return {"status": "error", "message": str(e)}