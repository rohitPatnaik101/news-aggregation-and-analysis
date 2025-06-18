import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  BarChart3, 
  Brain, 
  Search, 
  Loader2, 
  AlertCircle, 
  MessageSquare, 
  ExternalLink, 
  Calendar,
  Activity,
  Newspaper,
  Zap
} from 'lucide-react';

// Types
interface NewsArticle {
  _id: string;
  title: string;
  text: string;
  source: string;
  timestamp: string;
  sentiment?: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
  };
}

interface MarketData {
  totalArticles: number;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  recommendation: string;
}

interface QueryResult {
  query: string;
  type: 'news' | 'general' | 'error';
  articles?: NewsArticle[];
  marketData?: MarketData;
  generalResponse?: string;
  error?: string;
}

// API Service
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

const newsService = {
  async getNews(): Promise<NewsArticle[]> {
    try {
      const response = await api.get('/news');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news');
    }
  },

  async processQueries(queries: string[]): Promise<void> {
    try {
      await api.post('/process', { queries });
    } catch (error) {
      console.error('Error processing queries:', error);
      throw new Error('Failed to process queries');
    }
  },

  async processGeneralQuery(query: string): Promise<string> {
    try {
      const response = await api.post('/general_query', { queries: [query] });
      return response.data.response || 'No response available.';
    } catch (error) {
      console.error('Error processing general query:', error);
      throw new Error('Failed to process general query');
    }
  },
};

// Components
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span className="text-gray-300 text-lg">Loading...</span>
      </div>
    </div>
  );
};

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3 text-red-400 bg-red-900/20 px-6 py-4 rounded-lg border border-red-800">
        <AlertCircle className="w-6 h-6" />
        <span className="text-lg">{message}</span>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-white to-gray-300 p-4 rounded-full mr-4 shadow-lg">
          <Brain className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Financial News Analyst Agent
        </h1>
        <div className="bg-gradient-to-r from-gray-300 to-white p-4 rounded-full ml-4 shadow-lg">
          <Activity className="w-10 h-10 text-black" />
        </div>
      </div>
      <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
        AI-powered financial news analysis with sentiment insights and market trends
      </p>
    </div>
  );
};

const MarketOverview: React.FC<{ data: MarketData }> = ({ data }) => {
  const getTrendIcon = () => {
    switch (data.trend) {
      case 'bullish':
        return <TrendingUp className="w-8 h-8 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-8 h-8 text-red-400" />;
      default:
        return <Minus className="w-8 h-8 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'bullish':
        return 'text-green-400 bg-green-900/20 border-green-700';
      case 'bearish':
        return 'text-red-400 bg-red-900/20 border-red-700';
      default:
        return 'text-gray-400 bg-gray-800/50 border-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Sentiment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-900/20 border border-green-700 rounded-xl p-6 hover:bg-green-900/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-green-400 font-semibold text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Positive
            </span>
            <span className="text-3xl font-bold text-green-400">
              {Math.round(data.positiveRatio * 100)}%
            </span>
          </div>
          <div className="bg-green-800/30 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${data.positiveRatio * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 hover:bg-red-900/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-red-400 font-semibold text-lg flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              Negative
            </span>
            <span className="text-3xl font-bold text-red-400">
              {Math.round(data.negativeRatio * 100)}%
            </span>
          </div>
          <div className="bg-red-800/30 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${data.negativeRatio * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-semibold text-lg flex items-center">
              <Minus className="w-5 h-5 mr-2" />
              Neutral
            </span>
            <span className="text-3xl font-bold text-gray-400">
              {Math.round(data.neutralRatio * 100)}%
            </span>
          </div>
          <div className="bg-gray-700/50 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-gray-500 to-gray-400 h-3 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${data.neutralRatio * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-700 rounded-xl p-8 backdrop-blur-sm">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0 p-3 bg-white/10 rounded-full">
            {getTrendIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-lg font-semibold text-gray-300">Market Trend:</span>
              <span className={`px-4 py-2 rounded-full text-lg font-bold border ${getTrendColor()}`}>
                {data.trend.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              Based on the analysis of <strong className="text-white">{data.totalArticles}</strong> recent news articles, 
              <strong className="text-green-400"> {Math.round(data.positiveRatio * 100)}%</strong> of the sentiment is positive, 
              <strong className="text-red-400"> {Math.round(data.negativeRatio * 100)}%</strong> is negative, and 
              <strong className="text-gray-400"> {Math.round(data.neutralRatio * 100)}%</strong> is neutral. 
              The overall market trend appears to be <strong className="text-white">{data.trend}</strong>.
            </p>
            <div className="flex items-center space-x-3 text-white bg-white/10 p-4 rounded-lg">
              <Target className="w-6 h-6 text-white" />
              <span className="font-semibold text-lg">Recommendation:</span>
              <span className="text-lg">Consider <strong>{data.recommendation}</strong>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentNews: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-xl">No news available.</p>
      </div>
    );
  }

  const getSentimentIcon = (sentiment?: { label: string; score: number }) => {
    if (!sentiment) return <Minus className="w-5 h-5 text-gray-400" />;
    
    switch (sentiment.label) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment?: { label: string; score: number }) => {
    if (!sentiment) return 'text-gray-400 bg-gray-800/50 border-gray-600';
    
    switch (sentiment.label) {
      case 'positive':
        return 'text-green-400 bg-green-900/30 border-green-700';
      case 'negative':
        return 'text-red-400 bg-red-900/30 border-red-700';
      default:
        return 'text-gray-400 bg-gray-800/50 border-gray-600';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <div key={article._id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-900/70 hover:border-gray-600 transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-start justify-between space-x-6">
            <div className="flex-1">
              <h3 className="font-bold text-white text-xl mb-3 line-clamp-2 leading-tight">
                {article.title}
              </h3>
              {article.text && (
                <p className="text-gray-300 text-base mb-4 line-clamp-3 leading-relaxed">
                  {article.text}
                </p>
              )}
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.timestamp)}</span>
                </div>
                {article.source && (
                  <a 
                    href={article.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Read More</span>
                  </a>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold border ${getSentimentColor(article.sentiment)}`}>
                {getSentimentIcon(article.sentiment)}
                <span className="capitalize">
                  {article.sentiment?.label || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const QueryForm: React.FC<{ onSubmit: (queries: string[]) => void; loading: boolean }> = ({ onSubmit, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queries = input.trim().split('\n').filter(q => q.trim().length > 0);
    if (queries.length > 0) {
      onSubmit(queries);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="queries" className="block text-lg font-semibold text-white mb-3">
          Enter Stock Symbols, Company Names, or General Queries
        </label>
        <textarea
          id="queries"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your queries (one per line)&#10;Examples:&#10;Apple stock&#10;Tesla&#10;How to invest in crypto&#10;Microsoft earnings"
          className="w-full px-6 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-transparent resize-none transition-all duration-200 text-lg backdrop-blur-sm"
          rows={5}
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="w-full bg-gradient-to-r from-white to-gray-200 text-black py-4 px-8 rounded-xl font-bold text-lg hover:from-gray-200 hover:to-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Search className="w-6 h-6" />
            <span>Analyze</span>
          </>
        )}
      </button>
    </form>
  );
};

const QueryResults: React.FC<{ result: QueryResult }> = ({ result }) => {
  if (result.type === 'error') {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-xl p-8">
        <div className="flex items-center space-x-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <h3 className="text-2xl font-bold text-red-400">Error analyzing "{result.query}"</h3>
        </div>
        <p className="text-red-300 mt-4 text-lg">{result.error}</p>
      </div>
    );
  }

  if (result.type === 'general') {
    return (
      <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-8 backdrop-blur-sm">
        <div className="flex items-center space-x-4 mb-6">
          <MessageSquare className="w-8 h-8 text-white" />
          <h3 className="text-2xl font-bold text-white">Analysis for "{result.query}"</h3>
        </div>
        <p className="text-gray-300 mb-6 text-lg">No recent news articles found for '{result.query}'.</p>
        <div className="bg-white/10 border border-gray-600 rounded-lg p-6">
          <h4 className="font-bold text-white mb-4 text-lg">General Response</h4>
          <p className="text-gray-300 leading-relaxed text-lg">{result.generalResponse}</p>
        </div>
      </div>
    );
  }

  if (result.type === 'news' && result.articles && result.marketData) {
    const { marketData, articles } = result;
    
    const getSentimentIcon = (sentiment: string) => {
      switch (sentiment) {
        case 'positive':
          return <TrendingUp className="w-6 h-6 text-green-400" />;
        case 'negative':
          return <TrendingDown className="w-6 h-6 text-red-400" />;
        default:
          return <Minus className="w-6 h-6 text-gray-400" />;
      }
    };

    const getInsight = () => {
      if (marketData.positiveRatio > 0.5) {
        return `The news sentiment is predominantly positive, indicating potential growth opportunities for ${result.query}.`;
      } else if (marketData.negativeRatio > 0.5) {
        return `The news sentiment is predominantly negative, suggesting caution for ${result.query}.`;
      } else {
        return `The news sentiment is balanced, indicating a stable outlook for ${result.query}.`;
      }
    };

    return (
      <div className="bg-gray-900/50 border border-gray-600 rounded-xl shadow-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center space-x-4 mb-8">
          <BarChart3 className="w-8 h-8 text-white" />
          <h3 className="text-2xl font-bold text-white">Analysis for "{result.query}"</h3>
        </div>

        {/* Summary Points */}
        <div className="bg-gradient-to-r from-white/10 to-gray-800/50 border border-gray-600 rounded-xl p-6 mb-8">
          <h4 className="font-bold text-white mb-4 flex items-center text-xl">
            <Target className="w-6 h-6 text-white mr-3" />
            Analysis Summary
          </h4>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start space-x-3">
              <span className="font-bold text-white text-xl">•</span>
              <span className="text-lg"><strong className="text-white">Total Articles Analyzed:</strong> {marketData.totalArticles}</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="font-bold text-white text-xl">•</span>
              <span className="text-lg">
                <strong className="text-white">Sentiment Distribution:</strong> <span className="text-green-400">{Math.round(marketData.positiveRatio * 100)}% positive</span>, <span className="text-red-400">{Math.round(marketData.negativeRatio * 100)}% negative</span>, <span className="text-gray-400">{Math.round(marketData.neutralRatio * 100)}% neutral</span>
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="font-bold text-white text-xl">•</span>
              <span className="text-lg"><strong className="text-white">Insight:</strong> {getInsight()}</span>
            </li>
          </ul>
        </div>

        {/* Sentiment Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-900/20 border border-green-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-400 font-semibold flex items-center text-lg">
                {getSentimentIcon('positive')}
                <span className="ml-3">Positive</span>
              </span>
              <span className="text-2xl font-bold text-green-400">
                {Math.round(marketData.positiveRatio * 100)}%
              </span>
            </div>
            <div className="bg-green-800/30 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${marketData.positiveRatio * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-red-400 font-semibold flex items-center text-lg">
                {getSentimentIcon('negative')}
                <span className="ml-3">Negative</span>
              </span>
              <span className="text-2xl font-bold text-red-400">
                {Math.round(marketData.negativeRatio * 100)}%
              </span>
            </div>
            <div className="bg-red-800/30 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${marketData.negativeRatio * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 font-semibold flex items-center text-lg">
                {getSentimentIcon('neutral')}
                <span className="ml-3">Neutral</span>
              </span>
              <span className="text-2xl font-bold text-gray-400">
                {Math.round(marketData.neutralRatio * 100)}%
              </span>
            </div>
            <div className="bg-gray-700/50 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-gray-500 to-gray-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${marketData.neutralRatio * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent News for Query */}
        <div>
          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
            <Newspaper className="w-6 h-6 mr-3" />
            Recent News for {result.query}
          </h4>
          <RecentNews articles={articles} />
        </div>
      </div>
    );
  }

  return null;
};

// Main App Component
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <Header />
        
        <div className="space-y-12">
          {/* Market Overview Section */}
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <div className="w-3 h-10 bg-gradient-to-b from-white to-gray-400 rounded-full mr-4"></div>
              <Zap className="w-8 h-8 mr-3" />
              Market Overview
            </h2>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : marketData ? (
              <MarketOverview data={marketData} />
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
                <p className="text-gray-400 text-xl">No recent news available to generate a market overview. Please try analyzing a query to fetch news.</p>
              </div>
            )}
          </div>

          {/* Recent News Section */}
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <div className="w-3 h-10 bg-gradient-to-b from-white to-gray-400 rounded-full mr-4"></div>
              <Newspaper className="w-8 h-8 mr-3" />
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
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <div className="w-3 h-10 bg-gradient-to-b from-white to-gray-400 rounded-full mr-4"></div>
              <Search className="w-8 h-8 mr-3" />
              Analysis
            </h2>
            <QueryForm onSubmit={handleQuerySubmit} loading={analyzing} />
          </div>

          {/* Query Results Section */}
          {queryResults.length > 0 && (
            <div className="space-y-8">
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