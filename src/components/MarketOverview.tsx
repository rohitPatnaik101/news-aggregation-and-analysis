import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { MarketData } from '../types';

interface MarketOverviewProps {
  data: MarketData;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ data }) => {
  const getTrendIcon = () => {
    switch (data.trend) {
      case 'bullish':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      default:
        return <Minus className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sentiment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-green-700 font-medium">Positive</span>
            <span className="text-2xl font-bold text-green-600">
              {Math.round(data.positiveRatio * 100)}%
            </span>
          </div>
          <div className="mt-2 bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.positiveRatio * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-700 font-medium">Negative</span>
            <span className="text-2xl font-bold text-red-600">
              {Math.round(data.negativeRatio * 100)}%
            </span>
          </div>
          <div className="mt-2 bg-red-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.negativeRatio * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Neutral</span>
            <span className="text-2xl font-bold text-gray-600">
              {Math.round(data.neutralRatio * 100)}%
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gray-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.neutralRatio * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getTrendIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-sm font-medium text-gray-600">Market Trend:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTrendColor()}`}>
                {data.trend.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Based on the analysis of <strong>{data.totalArticles}</strong> recent news articles, 
              <strong> {Math.round(data.positiveRatio * 100)}%</strong> of the sentiment is positive, 
              <strong> {Math.round(data.negativeRatio * 100)}%</strong> is negative, and 
              <strong> {Math.round(data.neutralRatio * 100)}%</strong> is neutral. 
              The overall market trend appears to be <strong>{data.trend}</strong>.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-blue-700">
              <Target className="w-5 h-5" />
              <span className="font-medium">Recommendation:</span>
              <span>Consider <strong>{data.recommendation}</strong>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};