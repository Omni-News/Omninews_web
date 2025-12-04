import { apiClient } from '../client';
import type { RssChannel, RssItem } from '../../types';

export const rssApi = {
  // Create new RSS channel
  createChannel: (rssLink: string) =>
    apiClient.post<number>('/rss/channel', { rss_link: rssLink }),

  // Batch create channels
  createChannels: (rssLinks: { rss_link: string }[]) =>
    apiClient.post<boolean>('/rss/all', rssLinks),

  // Get channel ID by RSS link
  getChannelId: (channelRssLink: string) =>
    apiClient.get<number>(`/rss/id?channel_rss_link=${encodeURIComponent(channelRssLink)}`),

  // Get channel details
  getChannel: (channelId: number) =>
    apiClient.get<RssChannel>(`/rss/channel?channel_id=${channelId}`),

  // Get RSS items for a channel
  getChannelItems: (channelId: number, page: number) =>
    apiClient.get<RssItem[]>(`/rss/items?channel_id=${channelId}&page=${page}`),

  // Get recommended channels
  getRecommendedChannels: () =>
    apiClient.get<RssChannel[]>('/rss/recommend/channel'),

  // Get recommended items
  getRecommendedItems: () =>
    apiClient.get<RssItem[]>('/rss/recommend/item'),

  // Preview RSS feed
  previewFeed: (rssLink: string) =>
    apiClient.get<RssChannel>(`/rss/preview?rss_link=${encodeURIComponent(rssLink)}`),

  // Check if RSS exists
  checkRssExists: (rssLink: string) =>
    apiClient.get<boolean>(`/rss/exist?rss_link=${encodeURIComponent(rssLink)}`),

  // Update item rank
  updateItemRank: (rssId: number, num: number) =>
    apiClient.put('/rss/item/rank', { rss_id: rssId, num }),
};
