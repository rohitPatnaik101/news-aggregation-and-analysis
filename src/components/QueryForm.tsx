import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface QueryFormProps {
  onSubmit: (queries: string[]) => void;
  loading: boolean;
}

export const QueryForm: React.FC<QueryFormProps> = ({ onSubmit, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queries = input.trim().split('\n').filter(q => q.trim().length > 0);
    if (queries.length > 0) {
      onSubmit(queries);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="queries" className="block text-sm font-medium text-gray-700 mb-2">
          Enter a Stock or Company Name and Get News, Sentiment & Stock Trends
        </label>
        <textarea
          id="queries"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter stock symbols, company names, or general queries (one per line)&#10;Examples:&#10;Apple stock&#10;Tesla&#10;How to invest in crypto"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          rows={4}
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            <span>Analyze</span>
          </>
        )}
      </button>
    </form>
  );
};