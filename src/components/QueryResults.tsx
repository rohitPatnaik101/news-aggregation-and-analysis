import React from 'react';
import { AlertCircle, MessageSquare, TrendingUp, TrendingDown, Minus, Target, BarChart3 } from 'lucide-react';
import { QueryResult } from '../types';
import { RecentNews } from './RecentNews';

interface QueryResultsProps {
  result: QueryResult;
}

export const QueryResults: React.FC<QueryResultsProps> = ({ result }) => {
  if (result.type === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-semibold text-red-800">Error analyzing "{result.query}"</h3>
        </div>
        <p className="text-red-600 mt-2">{result.error}</p>
      </div>
    );
  }

  if (result.type === 'general') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-blue-800">Analysis for "{result.query}"</h3>
        </div>
        <p className="text-gray-600 mb-4">No recent news articles found for '{result.query}'.</p>
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">General Response</h4>
          <p className="text-gray-700 leading-relaxed">{result.generalResponse}</p>
        </div>
      </div>
    );
  }

  if (result.type === 'news' && result.articles && result.marketData) {
    const { marketData, articles } = result;
    
    const getSentimentIcon = (sentiment: string) => {
      switch (sentiment) {
        case 'positive':
          return <TrendingUp className="w-5 h-5 text-green-500" />;
        case 'negative':
          return <TrendingDown className="w-5 h-5 text-red-500" />;
        default:
          return <Minus className="w-5 h-5 text-gray-500" />;
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-800">Analysis for "{result.query}"</h3>
        </div>

        {/* Summary Points */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Target className="w-5 h-5 text-purple-500 mr-2" />
            Analysis Summary
          </h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-purple-600">•</span>
              <span><strong>Total Articles Analyzed:</strong> {marketData.totalArticles}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-purple-600">•</span>
              <span>
                <strong>Sentiment Distribution:</strong> {Math.round(marketData.positiveRatio * 100)}% positive, {Math.round(marketData.negativeRatio * 100)}% negative, {Math.round(marketData.neutralRatio * 100)}% neutral
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-purple-600">•</span>
              <span><strong>Insight:</strong> {getInsight()}</span>
            </li>
          </ul>
        </div>

        {/* Sentiment Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 font-medium flex items-center">
                {getSentimentIcon('positive')}
                <span className="ml-2">Positive</span>
              </span>
              <span className="text-xl font-bold text-green-600">
                {Math.round(marketData.positiveRatio * 100)}%
              </span>
            </div>
            <div className="bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${marketData.positiveRatio * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-700 font-medium flex items-center">
                {getSentimentIcon('negative')}
                <span className="ml-2">Negative</span>
              </span>
              <span className="text-xl font-bold text-red-600">
                {Math.round(marketData.negativeRatio * 100)}%
              </span>
            </div>
            <div className="bg-red-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${marketData.negativeRatio * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium flex items-center">
                {getSentimentIcon('neutral')}
                <span className="ml-2">Neutral</span>
              </span>
              <span className="text-xl font-bold text-gray-600">
                {Math.round(marketData.neutralRatio * 100)}%
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${marketData.neutralRatio * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent News for Query */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent News for {result.query}</h4>
          <RecentNews articles={articles} />
        </div>
      </div>
    );
  }

  return null;
};