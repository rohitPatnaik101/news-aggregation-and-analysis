import axios from 'axios';
import { NewsArticle } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const newsService = {
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