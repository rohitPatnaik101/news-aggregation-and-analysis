export interface NewsArticle {
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

export interface MarketData {
  totalArticles: number;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  recommendation: string;
}

export interface QueryResult {
  query: string;
  type: 'news' | 'general' | 'error';
  articles?: NewsArticle[];
  marketData?: MarketData;
  generalResponse?: string;
  error?: string;
}