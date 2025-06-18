import React from 'react';
import { ExternalLink, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NewsArticle } from '../types';

interface RecentNewsProps {
  articles: NewsArticle[];
}

export const RecentNews: React.FC<RecentNewsProps> = ({ articles }) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No news available.</p>
      </div>
    );
  }

  const getSentimentIcon = (sentiment?: { label: string; score: number }) => {
    if (!sentiment) return <Minus className="w-4 h-4 text-gray-400" />;
    
    switch (sentiment.label) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment?: { label: string; score: number }) => {
    if (!sentiment) return 'text-gray-600 bg-gray-100';
    
    switch (sentiment.label) {
      case 'positive':
        return 'text-green-700 bg-green-100';
      case 'negative':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
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
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                {article.title}
              </h3>
              {article.text && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {article.text}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.timestamp)}</span>
                </div>
                {article.source && (
                  <a 
                    href={article.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Source</span>
                  </a>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
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