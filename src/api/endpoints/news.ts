import { apiClient } from '../client';
import type { NewsItem, NewsCategory } from '../../types';

export const newsApi = {
  // Get news by category
  getNewsByCategory: (category: NewsCategory, page?: number) =>
    apiClient.get<NewsItem[]>(`/news?category=${encodeURIComponent(category)}${page ? `&page=${page}` : ''}`),
};
