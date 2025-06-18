import React from 'react';
import { TrendingUp, Brain } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Financial News Analyst Agent
        </h1>
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full ml-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
      </div>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        AI-powered financial news analysis with sentiment insights and market trends
      </p>
    </div>
  );
};