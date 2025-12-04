import { apiClient } from '../client';
import type { RssItem, RssChannel, SearchResult, SearchType, SortType, NewsItem } from '../../types';

export const searchApi = {
  // Search RSS items
  searchItems: (searchValue: string, searchType: SearchType, pageSize: number, page: number = 1) =>
    apiClient.get<SearchResult<RssItem>>(
      `/search/item?search_value=${encodeURIComponent(searchValue)}&search_type=${searchType}&page_size=${pageSize}&page=${page}`
    ),

  // Search RSS channels
  searchChannels: (searchValue: string, searchType: SearchType, pageSize: number, page: number = 1) =>
    apiClient.get<SearchResult<RssChannel>>(
      `/search/channels?search_value=${encodeURIComponent(searchValue)}&search_type=${searchType}&page_size=${pageSize}&page=${page}`
    ),

  // Search news from external API
  searchNewsApi: (query: string, display: number, sort: SortType, start: number = 1) =>
    apiClient.get<NewsItem[]>(
      `/search/news_api?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}&start=${start}`
    ),
};
