import streamlit as st
import requests
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set page title
st.title("Financial News Analyst Agent (AI Agents)")

# Function to fetch news and compute sentiment summary
def fetch_news_and_summarize(query):
    try:
        response = requests.post("http://localhost:8000/process", json={"queries": [query]})
        if response.status_code != 200:
            return None, None
        news_response = requests.get("http://localhost:8000/news")
        if news_response.status_code != 200:
            return None, None
        news = news_response.json()
        if not news:
            return None, None
        news_df = pd.DataFrame(news)
        news_df["sentiment_label"] = news_df["sentiment"].apply(lambda x: x["label"] if isinstance(x, dict) and "label" in x else "N/A")
        # Filter for articles related to the query
        news_df = news_df[news_df["title"].str.contains(query, case=False, na=False) | news_df["text"].str.contains(query, case=False, na=False)]
        if news_df.empty:
            return None, None
        # Compute sentiment summary
        sentiments = news_df["sentiment"].apply(lambda x: x["label"] if isinstance(x, dict) and "label" in x else "neutral")
        sentiment_counts = sentiments.value_counts()
        total_articles = len(sentiments)
        positive_ratio = sentiment_counts.get("positive", 0) / total_articles
        negative_ratio = sentiment_counts.get("negative", 0) / total_articles
        neutral_ratio = sentiment_counts.get("neutral", 0) / total_articles
        return news_df, (positive_ratio, negative_ratio, neutral_ratio, total_articles)
    except requests.RequestException as e:
        logger.error(f"Error fetching news for {query}: {e}")
        return None, None

# Fetch Recent News on Page Load (shared between Market Overview and Recent News sections)
st.subheader("Recent News")
news_df = None
try:
    response = requests.get("http://localhost:8000/news")
    if response.status_code == 200:
        news = response.json()
        if news:
            news_df = pd.DataFrame(news)
            news_df["sentiment_label"] = news_df["sentiment"].apply(lambda x: x["label"] if isinstance(x, dict) and "label" in x else "N/A")
            columns = ["title", "source", "sentiment_label", "timestamp"]
            available_columns = [col for col in columns if col in news_df.columns]
            st.dataframe(news_df[available_columns])
        else:
            st.write("No news available.")
    else:
        logger.error(f"Failed to fetch news: {response.status_code} - {response.text}")
        st.error("Failed to fetch news from backend.")
except requests.RequestException as e:
    logger.error(f"Error fetching news: {e}")
    st.error(f"Error fetching news: {e}")

# Market Overview on Page Load (using Recent News data)
st.subheader("Market Overview")
if news_df is not None and not news_df.empty:
    # Compute sentiment summary from Recent News
    sentiments = news_df["sentiment"].apply(lambda x: x["label"] if isinstance(x, dict) and "label" in x else "neutral")
    sentiment_counts = sentiments.value_counts()
    total_articles = len(sentiments)
    positive_ratio = sentiment_counts.get("positive", 0) / total_articles
    negative_ratio = sentiment_counts.get("negative", 0) / total_articles
    neutral_ratio = sentiment_counts.get("neutral", 0) / total_articles
    # Determine overall market trend
    market_trend = "neutral"
    if positive_ratio > 0.6:
        market_trend = "bullish"
    elif negative_ratio > 0.6:
        market_trend = "bearish"
    # Generate market overview
    overview = (
        f"Based on the analysis of {total_articles} recent news articles, "
        f"{positive_ratio:.0%} of the sentiment is positive, "
        f"{negative_ratio:.0%} is negative, and "
        f"{neutral_ratio:.0%} is neutral. "
        f"The overall market trend appears to be **{market_trend}**. "
        f"Recommendation: Consider **{'investing in growth sectors' if market_trend == 'bullish' else 'a defensive strategy' if market_trend == 'bearish' else 'monitoring key indicators'}**."
    )
    st.write(overview)
else:
    st.write("No recent news available to generate a market overview. Please try analyzing a query to fetch news.")

# Input form for queries
with st.form("input_form"):
    queries = st.text_area(" Enter a Stock or Company Name and Get News, Sentiment & Stock Trends").splitlines()
    submitted = st.form_submit_button("Analyze")

# Process form submission and display results
if submitted:
    if queries:
        for query in queries:
            st.subheader(f"Analysis for {query}")
            # First, try to fetch news-related results
            news_df_query, summary = fetch_news_and_summarize(query)
            if news_df_query is not None and summary is not None:
                positive_ratio, negative_ratio, neutral_ratio, total_articles = summary
                # Generate bullet-point summary
                summary_points = [
                    f"**Total Articles Analyzed**: {total_articles}",
                    f"**Sentiment Distribution**: {positive_ratio:.0%} positive, {negative_ratio:.0%} negative, {neutral_ratio:.0%} neutral",
                ]
                # Add key insights
                if positive_ratio > 0.5:
                    summary_points.append(f"**Insight**: The news sentiment is predominantly positive, indicating potential growth opportunities for {query}.")
                elif negative_ratio > 0.5:
                    summary_points.append(f"**Insight**: The news sentiment is predominantly negative, suggesting caution for {query}.")
                else:
                    summary_points.append(f"**Insight**: The news sentiment is balanced, indicating a stable outlook for {query}.")
                # Display summary in bullet points
                for point in summary_points:
                    st.markdown(point)
                # Display recent news
                st.subheader(f"Recent News for {query}")
                columns = ["title", "source", "sentiment_label", "timestamp"]
                available_columns = [col for col in columns if col in news_df_query.columns]
                st.dataframe(news_df_query[available_columns])
            else:
                # No news found, fall back to general agent
                st.write(f"No recent news articles found for '{query}'.")
                st.subheader("General Response")
                try:
                    response = requests.post("http://localhost:8000/general_query", json={"queries": [query]})
                    if response.status_code == 200:
                        general_response = response.json().get("response", "No response available.")
                        st.write(general_response)
                    else:
                        st.error(f"Failed to process general query: {response.status_code} - {response.text}")
                except requests.RequestException as e:
                    st.error(f"Error processing general query: {e}")
    else:
        st.warning("Please provide at least one query.")