import { apiClient } from '../client';
import type { RssChannel, RssItem, SubscriptionStatus } from '../../types';

export const subscriptionApi = {
  // Subscribe to a channel
  subscribe: (channelId: number) =>
    apiClient.post<string>('/subscription/channel_sub', { channel_id: channelId }),

  // Unsubscribe from a channel
  unsubscribe: async (channelId: number) => {
    console.log('Unsubscribing from channel:', channelId);
    const response = await apiClient.request<string>({
      method: 'DELETE',
      url: '/subscription/channel',
      data: { channel_id: channelId },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Unsubscribe response:', response);
    return response;
  },

  // Check subscription status
  checkStatus: (channelRssLink: string) =>
    apiClient.get<boolean>(`/subscription/status?channel_rss_link=${encodeURIComponent(channelRssLink)}`),

  // Get subscribed channels
  getChannels: () =>
    apiClient.get<RssChannel[]>('/subscription/channels'),

  // Get items from subscribed channels
  getItems: (channelIds: string, page: number) =>
    apiClient.get<RssItem[]>(`/subscription/items?channel_ids=${channelIds}&page=${page}`),

  // Verify OmniNews subscription (premium)
  verifyOmniNewsSubscription: () =>
    apiClient.get<SubscriptionStatus>('/subscription/verify'),

  // Register subscription (in-app purchase)
  registerSubscription: (transactionId: string, platform: string, isTest: boolean) =>
    apiClient.post<boolean>('/subscription/register', {
      transaction_id: transactionId,
      platform,
      is_test: isTest,
    }),
};
