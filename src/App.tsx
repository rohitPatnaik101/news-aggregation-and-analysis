import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarketOverview } from './components/MarketOverview';
import { RecentNews } from './components/RecentNews';
import { QueryForm } from './components/QueryForm';
import { QueryResults } from './components/QueryResults';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { newsService } from './services/newsService';
import { NewsArticle, MarketData, QueryResult } from './types';

function App() {
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchRecentNews();
  }, []);

  const fetchRecentNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const news = await newsService.getNews();
      setRecentNews(news);
      
      if (news.length > 0) {
        const marketOverview = calculateMarketOverview(news);
        setMarketData(marketOverview);
      }
    } catch (err) {
      setError('Failed to fetch recent news. Please try again.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMarketOverview = (news: NewsArticle[]): MarketData => {
    const sentiments = news.map(article => 
      article.sentiment?.label || 'neutral'
    );
    
    const totalArticles = sentiments.length;
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;
    const neutralCount = sentiments.filter(s => s === 'neutral').length;
    
    const positiveRatio = positiveCount / totalArticles;
    const negativeRatio = negativeCount / totalArticles;
    const neutralRatio = neutralCount / totalArticles;
    
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (positiveRatio > 0.6) {
      trend = 'bullish';
    } else if (negativeRatio > 0.6) {
      trend = 'bearish';
    }
    
    let recommendation = 'monitoring key indicators';
    if (trend === 'bullish') {
      recommendation = 'investing in growth sectors';
    } else if (trend === 'bearish') {
      recommendation = 'a defensive strategy';
    }
    
    return {
      totalArticles,
      positiveRatio,
      negativeRatio,
      neutralRatio,
      trend,
      recommendation
    };
  };

  const handleQuerySubmit = async (queries: string[]) => {
    if (queries.length === 0) return;
    
    setAnalyzing(true);
    const results: QueryResult[] = [];
    
    for (const query of queries) {
      try {
        // First try to process as financial news query
        await newsService.processQueries([query]);
        
        // Fetch updated news to get query-specific results
        const allNews = await newsService.getNews();
        const queryNews = allNews.filter(article => 
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.text.toLowerCase().includes(query.toLowerCase())
        );
        
        if (queryNews.length > 0) {
          const queryMarketData = calculateMarketOverview(queryNews);
          results.push({
            query,
            type: 'news',
            articles: queryNews,
            marketData: queryMarketData
          });
        } else {
          // Fall back to general query
          const generalResponse = await newsService.processGeneralQuery(query);
          results.push({
            query,
            type: 'general',
            generalResponse
          });
        }
      } catch (err) {
        console.error(`Error processing query "${query}":`, err);
        results.push({
          query,
          type: 'error',
          error: 'Failed to process query. Please try again.'
        });
      }
    }
    
    setQueryResults(results);
    setAnalyzing(false);
    
    // Refresh recent news after processing
    fetchRecentNews();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
        
        <div className="space-y-8">
          {/* Market Overview Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
              Market Overview
            </h2>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : marketData ? (
              <MarketOverview data={marketData} />
            ) : (
              <p className="text-gray-600">No recent news available to generate a market overview. Please try analyzing a query to fetch news.</p>
            )}
          </div>

          {/* Recent News Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
              Recent News
            </h2>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <RecentNews articles={recentNews} />
            )}
          </div>

          {/* Query Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
              Analysis
            </h2>
            <QueryForm onSubmit={handleQuerySubmit} loading={analyzing} />
          </div>

          {/* Query Results Section */}
          {queryResults.length > 0 && (
            <div className="space-y-6">
              {queryResults.map((result, index) => (
                <QueryResults key={index} result={result} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;