import { useState, useRef, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Link,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import { Add, ExpandMore, ExpandLess, Search as SearchIcon, Close } from '@mui/icons-material';
import { newsApi } from '../api/endpoints/news';
import { rssApi } from '../api/endpoints/rss';
import { subscriptionApi } from '../api/endpoints/subscription';
import { searchApi } from '../api/endpoints/search';
import { useAuthStore } from '../store/authStore';
import type { NewsCategory, NewsItem, RssChannel, RssItem } from '../types';

const categories: NewsCategory[] = ['IT/과학', '정치', '경제', '사회', '생활/문화', '세계'];

// Helper function to get relative time
function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const pubDate = new Date(date);
  const diffMs = now.getTime() - pubDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays === 1) return '하루 전';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

// News card component
function NewsCard({ category }: { category: NewsCategory }) {
  const {
    data: newsItemsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['news', category],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data } = await newsApi.getNewsByCategory(category, pageParam);
      return data || [];
    },
    getNextPageParam: (_lastPage, allPages) => {
      return _lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const newsItems = (newsItemsData?.pages.flat() || []) as NewsItem[];

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return (
    <Card sx={{ minWidth: 320, maxWidth: 320, height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 700,
            mb: 2,
            pb: 1,
            borderBottom: '3px solid #ff8c00',
            color: '#ff8c00',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          {category}
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !newsItems || newsItems.length === 0 ? (
          <Alert severity="info" sx={{ border: 'none', fontSize: '0.75rem' }}>
            뉴스가 없습니다
          </Alert>
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {newsItems.map((news: NewsItem, index) => (
              <Box
                key={news.news_id || news.news_link}
                ref={index === newsItems.length - 1 ? lastItemRef : null}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid #e0e0e0',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Link
                  href={news.news_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="inherit"
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    display: 'block',
                    mb: 0.5,
                    color: '#e0e0e0',
                    '&:hover': {
                      color: '#ff8c00',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {news.news_title}
                </Link>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {news.news_source && (
                    <Typography variant="caption" sx={{ color: '#808080', fontSize: '0.7rem', fontFamily: '"Courier New", Courier, monospace' }}>
                      [{news.news_source}]
                    </Typography>
                  )}
                  {news.news_pub_date && (
                    <Typography variant="caption" sx={{ color: '#808080', fontSize: '0.7rem', fontFamily: '"Courier New", Courier, monospace' }}>
                      {getRelativeTime(news.news_pub_date)}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
            {isFetchingNextPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function News() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [rssUrl, setRssUrl] = useState('');
  const [channelsExpanded, setChannelsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTab, setSearchTab] = useState(0);
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: channels } = useQuery({
    queryKey: ['subscribed-channels'],
    queryFn: async () => {
      const { data } = await subscriptionApi.getChannels();
      return data || [];
    },
    enabled: isAuthenticated,
  });

  // Fetch recommended channels
  const { data: recommendedChannels, isLoading: recommendedLoading } = useQuery({
    queryKey: ['recommended-channels'],
    queryFn: async () => {
      const { data } = await rssApi.getRecommendedChannels();
      return data || [];
    },
    enabled: addDialogOpen,
  });

  // Fetch all RSS items from subscribed channels with infinite scroll
  const {
    data: rssItemsData,
    isLoading: rssItemsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['all-rss-items', channels],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      if (!channels || channels.length === 0) return [];

      // Use batch API to fetch all items in a single request
      const channelIds = channels.map(ch => ch.channel_id).join(',');
      const { data } = await subscriptionApi.getItems(channelIds, pageParam);

      // Map channel titles to items
      const itemsWithTitles = data.map((item: RssItem) => {
        const channel = channels.find(ch => ch.channel_id === item.channel_id);
        return {
          ...item,
          channel_title: channel?.channel_title,
        };
      });

      // Sort by date
      return itemsWithTitles.sort((a, b) => {
        const dateA = new Date(a.rss_pub_date || 0).getTime();
        const dateB = new Date(b.rss_pub_date || 0).getTime();
        return dateB - dateA;
      });
    },
    getNextPageParam: (_lastPage, allPages) => {
      // If last page has items, there might be more pages
      return _lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!channels && channels.length > 0,
  });

  // Flatten all pages into a single array
  const allRssItems = (rssItemsData?.pages.flat() || []) as (RssItem & { channel_title?: string })[];

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (rssItemsLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [rssItemsLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Add RSS mutation
  const addRssMutation = useMutation({
    mutationFn: async (url: string) => {
      const { data: channelId } = await rssApi.createChannel(url);
      await subscriptionApi.subscribe(channelId);
      return channelId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribed-channels'] });
      setAddDialogOpen(false);
      setRssUrl('');
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async (channelId: number) => {
      await subscriptionApi.unsubscribe(channelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribed-channels'] });
      queryClient.invalidateQueries({ queryKey: ['all-rss-items'] });
    },
  });

  // Subscribe to recommended channel
  const subscribeMutation = useMutation({
    mutationFn: async (channelId: number) => {
      await subscriptionApi.subscribe(channelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribed-channels'] });
      queryClient.invalidateQueries({ queryKey: ['recommended-channels'] });
    },
  });

  const handleAddRss = () => {
    if (rssUrl.trim()) {
      addRssMutation.mutate(rssUrl);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery);
      setSearchDialogOpen(true);
    }
  };

  // Search results queries with infinite scroll
  const {
    data: searchItemsData,
    isLoading: searchItemsLoading,
    fetchNextPage: fetchNextSearchItems,
    hasNextPage: hasNextSearchItems,
    isFetchingNextPage: isFetchingNextSearchItems,
  } = useInfiniteQuery({
    queryKey: ['search-items', activeSearch],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data } = await searchApi.searchItems(activeSearch, 'Accuracy', 20, pageParam);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // If last page has items, there might be more pages
      return lastPage.items && lastPage.items.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!activeSearch && searchDialogOpen,
  });

  const {
    data: searchChannelsData,
    isLoading: searchChannelsLoading,
    fetchNextPage: fetchNextSearchChannels,
    hasNextPage: hasNextSearchChannels,
    isFetchingNextPage: isFetchingNextSearchChannels,
  } = useInfiniteQuery({
    queryKey: ['search-channels', activeSearch],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data } = await searchApi.searchChannels(activeSearch, 'Accuracy', 20, pageParam);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.channels && lastPage.channels.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!activeSearch && searchDialogOpen,
  });

  const {
    data: searchNewsData,
    isLoading: searchNewsLoading,
    fetchNextPage: fetchNextSearchNews,
    hasNextPage: hasNextSearchNews,
    isFetchingNextPage: isFetchingNextSearchNews,
  } = useInfiniteQuery({
    queryKey: ['search-news', activeSearch],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data } = await searchApi.searchNewsApi(activeSearch, 20, 'sim', pageParam);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!activeSearch && searchDialogOpen,
  });

  // Flatten search results
  const searchItemsResult = {
    items: (searchItemsData?.pages.flatMap((page) => page.items || []) || []) as RssItem[],
  };
  const searchChannelsResult = {
    channels: (searchChannelsData?.pages.flatMap((page) => page.channels || []) || []) as RssChannel[],
  };
  const searchNewsResult = (searchNewsData?.pages.flat() || []) as NewsItem[];

  // Observers for search infinite scroll
  const searchItemsObserver = useRef<IntersectionObserver | null>(null);
  const lastSearchItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (searchItemsLoading || isFetchingNextSearchItems) return;
      if (searchItemsObserver.current) searchItemsObserver.current.disconnect();

      searchItemsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextSearchItems) {
          fetchNextSearchItems();
        }
      });

      if (node) searchItemsObserver.current.observe(node);
    },
    [searchItemsLoading, isFetchingNextSearchItems, hasNextSearchItems, fetchNextSearchItems]
  );

  const searchChannelsObserver = useRef<IntersectionObserver | null>(null);
  const lastSearchChannelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (searchChannelsLoading || isFetchingNextSearchChannels) return;
      if (searchChannelsObserver.current) searchChannelsObserver.current.disconnect();

      searchChannelsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextSearchChannels) {
          fetchNextSearchChannels();
        }
      });

      if (node) searchChannelsObserver.current.observe(node);
    },
    [searchChannelsLoading, isFetchingNextSearchChannels, hasNextSearchChannels, fetchNextSearchChannels]
  );

  const searchNewsObserver = useRef<IntersectionObserver | null>(null);
  const lastSearchNewsRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (searchNewsLoading || isFetchingNextSearchNews) return;
      if (searchNewsObserver.current) searchNewsObserver.current.disconnect();

      searchNewsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextSearchNews) {
          fetchNextSearchNews();
        }
      });

      if (node) searchNewsObserver.current.observe(node);
    },
    [searchNewsLoading, isFetchingNextSearchNews, hasNextSearchNews, fetchNextSearchNews]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff8c00', textTransform: 'uppercase', letterSpacing: '3px' }}>
          ▓▓▓ Dashboard ▓▓▓
        </Typography>
        <TextField
          size="small"
          placeholder="SEARCH..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#ff8c00' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              color: '#e0e0e0',
              fontFamily: '"Courier New", Courier, monospace',
              bgcolor: '#1a1a1a',
              border: '2px solid #333',
              '& fieldset': { border: 'none' },
              '&:hover': {
                borderColor: '#ff8c00',
              },
              '&.Mui-focused': {
                borderColor: '#ff8c00',
              },
            },
          }}
        />
        <Button
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          sx={{
            minWidth: 100,
            bgcolor: '#0a0a0a',
            color: '#ff8c00',
            border: '2px solid #ff8c00',
            '&:hover': {
              bgcolor: '#ff8c00',
              color: '#0a0a0a',
            },
            '&:disabled': {
              border: '2px solid #333',
              color: '#333',
            },
          }}
        >
          GO
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, height: 'calc(100vh - 180px)' }}>
        {/* RSS Subscriptions Card - Left */}
        <Card sx={{ minWidth: 320, maxWidth: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#ff8c00', textTransform: 'uppercase', letterSpacing: '2px' }}>
                ▶ My RSS
              </Typography>
              {isAuthenticated && (
                <IconButton size="small" onClick={() => setAddDialogOpen(true)}>
                  <Add fontSize="small" />
                </IconButton>
              )}
            </Box>

            {!isAuthenticated ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: 2,
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#ff8c00',
                    textAlign: 'center',
                    fontFamily: '"Courier New", Courier, monospace',
                    textTransform: 'uppercase',
                  }}
                >
                  ▓ LOGIN REQUIRED ▓
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    color: '#808080',
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  MY RSS 기능을 사용하려면
                  <br />
                  로그인이 필요합니다
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    border: '2px solid rgba(255, 140, 0, 0.3)',
                    backgroundColor: 'rgba(255, 140, 0, 0.05)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.75rem',
                      color: '#808080',
                      textAlign: 'center',
                      display: 'block',
                    }}
                  >
                    상단의 Login 버튼을 클릭하여
                    <br />
                    로그인 후 이용해주세요
                  </Typography>
                </Box>
              </Box>
            ) : !channels || channels.length === 0 ? (
              <Alert severity="info" sx={{ border: 'none', fontSize: '0.8rem' }}>
                구독한 RSS가 없습니다
              </Alert>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Subscribed Channels Section - Collapsible */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      py: 0.5,
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                    onClick={() => setChannelsExpanded(!channelsExpanded)}
                  >
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#ff6b35', textTransform: 'uppercase' }}>
                      ◆ 구독 채널 ({channels.length})
                    </Typography>
                    <IconButton size="small">
                      {channelsExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                  </Box>
                  {channelsExpanded && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {channels.map((channel: RssChannel) => (
                        <Chip
                          key={channel.channel_id}
                          label={channel.channel_title}
                          size="small"
                          onDelete={() => unsubscribeMutation.mutate(channel.channel_id!)}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* RSS Feed Items Section */}
                <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 1, pb: 1, borderBottom: '3px solid #ff8c00', color: '#ff8c00', textTransform: 'uppercase' }}>
                    ■ 최신 피드
                  </Typography>
                  {rssItemsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : !allRssItems || allRssItems.length === 0 ? (
                    <Alert severity="info" sx={{ border: 'none', fontSize: '0.75rem' }}>
                      피드가 없습니다
                    </Alert>
                  ) : (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      {allRssItems.map((item: RssItem & { channel_title?: string }, index) => (
                        <Box
                          key={item.rss_id}
                          ref={index === allRssItems.length - 1 ? lastItemRef : null}
                          sx={{
                            py: 1.5,
                            borderBottom: '1px solid #e0e0e0',
                            '&:last-child': { borderBottom: 'none' },
                          }}
                        >
                          <Link
                            href={item.rss_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            color="inherit"
                            sx={{
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              display: 'block',
                              mb: 0.5,
                              color: '#e0e0e0',
                              '&:hover': {
                                color: '#ff8c00',
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {item.rss_title}
                          </Link>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            {item.channel_title && (
                              <Chip
                                label={item.channel_title}
                                size="small"
                                sx={{ height: 16, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 }, fontWeight: 700 }}
                              />
                            )}
                            {item.rss_pub_date && (
                              <Typography variant="caption" sx={{ color: '#808080', fontSize: '0.65rem', fontFamily: '"Courier New", Courier, monospace' }}>
                                {getRelativeTime(item.rss_pub_date)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                      {isFetchingNextPage && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={20} />
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* News Category Cards */}
        {categories.map((category) => (
          <NewsCard key={category} category={category} />
        ))}
      </Box>

      {/* Add RSS Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add RSS Feed</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="RSS Feed URL"
            type="url"
            fullWidth
            variant="outlined"
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
            placeholder="https://example.com/feed.xml"
          />
          {addRssMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to add RSS feed. Please check the URL and try again.
            </Alert>
          )}

          {/* Recommended Channels */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              추천 채널
            </Typography>
            {recommendedLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (() => {
              const subscribedIds = new Set(channels?.map(ch => ch.channel_id) || []);
              const filteredRecommended = recommendedChannels?.filter(
                (channel: RssChannel) => !subscribedIds.has(channel.channel_id)
              ) || [];

              if (filteredRecommended.length === 0) {
                return (
                  <Alert severity="info" sx={{ border: '1px solid #e0e0e0' }}>
                    추천 채널이 없습니다
                  </Alert>
                );
              }

              return (
                <List disablePadding sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  {filteredRecommended.map((channel: RssChannel) => (
                    <ListItem
                      key={channel.channel_id}
                      disablePadding
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => subscribeMutation.mutate(channel.channel_id!)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemButton sx={{ py: 1 }}>
                        <ListItemText
                          primary={channel.channel_title}
                          secondary={channel.channel_description}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.8rem',
                            noWrap: true,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              );
            })()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Close</Button>
          <Button
            onClick={handleAddRss}
            variant="contained"
            disabled={addRssMutation.isPending || !rssUrl.trim()}
            sx={{
              bgcolor: '#0a0a0a',
              color: '#ff8c00',
              border: '2px solid #ff8c00',
              '&:hover': {
                bgcolor: '#ff8c00',
                color: '#0a0a0a',
              }
            }}
          >
            {addRssMutation.isPending ? 'Adding...' : 'Add URL'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Results Dialog */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '3px solid #ff8c00',
          }
        }}
      >
        <DialogTitle sx={{ color: '#ff8c00', fontFamily: '"Courier New", Courier, monospace', textTransform: 'uppercase' }}>
          ▶ Search Results: "{activeSearch}"
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={searchTab}
            onChange={(_, val) => setSearchTab(val)}
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                color: '#808080',
                fontFamily: '"Courier New", Courier, monospace',
                textTransform: 'uppercase',
                '&.Mui-selected': { color: '#ff8c00' },
              },
              '& .MuiTabs-indicator': { bgcolor: '#ff8c00' },
            }}
          >
            <Tab label="RSS Items" />
            <Tab label="Channels" />
            <Tab label="News" />
          </Tabs>

          {/* RSS Items */}
          {searchTab === 0 && (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {searchItemsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: '#ff8c00' }} />
                </Box>
              ) : !searchItemsResult?.items || searchItemsResult.items.length === 0 ? (
                <Alert severity="info" sx={{ border: '1px solid #333' }}>No RSS items found</Alert>
              ) : (
                <>
                  {searchItemsResult.items.map((item: RssItem, index) => (
                    <Box
                      key={item.rss_id}
                      ref={index === searchItemsResult.items.length - 1 ? lastSearchItemRef : null}
                      sx={{ mb: 2, pb: 2, borderBottom: '1px solid #333' }}
                    >
                      <Link
                        href={item.rss_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#e0e0e0', fontWeight: 500, '&:hover': { color: '#ff8c00' } }}
                      >
                        {item.rss_title}
                      </Link>
                      {item.rss_pub_date && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#808080', mt: 0.5 }}>
                          {getRelativeTime(item.rss_pub_date)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                  {isFetchingNextSearchItems && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#ff8c00' }} />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Channels */}
          {searchTab === 1 && (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {searchChannelsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: '#ff8c00' }} />
                </Box>
              ) : !searchChannelsResult?.channels || searchChannelsResult.channels.length === 0 ? (
                <Alert severity="info" sx={{ border: '1px solid #333' }}>No channels found</Alert>
              ) : (
                <>
                  {searchChannelsResult.channels.map((channel: RssChannel, index) => (
                    <Box
                      key={channel.channel_id}
                      ref={index === searchChannelsResult.channels.length - 1 ? lastSearchChannelRef : null}
                      sx={{ mb: 2, pb: 2, borderBottom: '1px solid #333' }}
                    >
                      <Link
                        href={channel.channel_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#e0e0e0', fontWeight: 600, '&:hover': { color: '#ff8c00' } }}
                      >
                        {channel.channel_title}
                      </Link>
                      <Typography variant="body2" sx={{ color: '#808080', mt: 0.5 }}>
                        {channel.channel_description}
                      </Typography>
                    </Box>
                  ))}
                  {isFetchingNextSearchChannels && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#ff8c00' }} />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {/* News */}
          {searchTab === 2 && (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {searchNewsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: '#ff8c00' }} />
                </Box>
              ) : !searchNewsResult || searchNewsResult.length === 0 ? (
                <Alert severity="info" sx={{ border: '1px solid #333' }}>No news found</Alert>
              ) : (
                <>
                  {searchNewsResult.map((news: NewsItem, idx: number) => (
                    <Box
                      key={idx}
                      ref={idx === searchNewsResult.length - 1 ? lastSearchNewsRef : null}
                      sx={{ mb: 2, pb: 2, borderBottom: '1px solid #333' }}
                    >
                      <Link
                        href={news.news_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#e0e0e0', fontWeight: 500, '&:hover': { color: '#ff8c00' } }}
                      >
                        <span dangerouslySetInnerHTML={{ __html: news.news_title || '' }} />
                      </Link>
                      {news.news_pub_date && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#808080', mt: 0.5 }}>
                          {news.news_pub_date}
                        </Typography>
                      )}
                    </Box>
                  ))}
                  {isFetchingNextSearchNews && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#ff8c00' }} />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)} sx={{ color: '#ff8c00' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
