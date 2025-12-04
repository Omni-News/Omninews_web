// API Response Types

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  user_email?: string;
  user_display_name?: string;
  user_photo_url?: string;
  user_social_login_provider?: string;
  user_social_provider_id?: string;
  user_platform?: string;
}

export interface DemoLoginRequest {
  user_email?: string;
  user_password?: string;
}

export interface RefreshTokenRequest {
  token: string;
  email: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface User {
  email: string;
  displayName?: string;
  photoUrl?: string;
  theme?: string;
}

export interface NewsItem {
  news_id?: number;
  news_title?: string;
  news_description?: string;
  news_summary?: string;
  news_link?: string;
  news_source?: string;
  news_pub_date?: string;
  news_image_link?: string;
  news_category?: string;
}

export interface RssChannel {
  channel_id?: number;
  channel_title?: string;
  channel_link?: string;
  channel_description?: string;
  channel_image_url?: string;
  channel_language?: string;
  rss_generator?: string;
  channel_rank?: number;
  channel_rss_link?: string;
}

export interface RssItem {
  rss_id?: number;
  channel_id?: number;
  rss_title?: string;
  rss_description?: string;
  rss_link?: string;
  rss_author?: string;
  rss_pub_date?: string;
  rss_rank?: number;
  rss_image_link?: string;
}

export interface Folder {
  folder_id?: number;
  folder_name?: string;
  channels?: RssChannel[];
}

export interface SearchResult<T> {
  items?: T[];
  channels?: RssChannel[];
  total_count?: number;
}

export interface SubscriptionStatus {
  is_subscribed: boolean;
  subscription_end_date?: string;
}

export interface NotificationSettings {
  user_notification_push?: boolean;
  user_fcm_token?: string;
}

export interface ThemeResponse {
  theme: string;
}

export interface ThemeRequest {
  theme?: string;
}

export type NewsCategory = '정치' | '경제' | '사회' | '생활/문화' | '세계' | 'IT/과학';

export type SearchType = 'Accuracy' | 'Popularity' | 'Latest';

export type SortType = 'sim' | 'date';
