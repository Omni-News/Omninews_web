import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Link,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  IconButton,
  Chip,
  Pagination,
} from '@mui/material';
import { Add, Delete, Star } from '@mui/icons-material';
import { rssApi } from '../api/endpoints/rss';
import { subscriptionApi } from '../api/endpoints/subscription';
import { useAuthStore } from '../store/authStore';
import type { RssChannel, RssItem } from '../types';

export default function RssFeed() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [rssUrl, setRssUrl] = useState('');
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch subscribed channels
  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['subscribed-channels'],
    queryFn: async () => {
      const { data } = await subscriptionApi.getChannels();
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 30000, // Keep data fresh for 30 seconds
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  // Fetch recommended channels
  const { data: recommendedChannels } = useQuery({
    queryKey: ['recommended-channels'],
    queryFn: async () => {
      const { data } = await rssApi.getRecommendedChannels();
      return data;
    },
    enabled: tabValue === 1,
  });

  // Fetch RSS items
  const { data: rssItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['rss-items', selectedChannel, page],
    queryFn: async () => {
      if (!selectedChannel) return [];
      const { data } = await rssApi.getChannelItems(selectedChannel, page);
      return data;
    },
    enabled: !!selectedChannel,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (channelId: number) => {
      await subscriptionApi.subscribe(channelId);
      return channelId;
    },
    onMutate: async (channelId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscribed-channels'] });
      await queryClient.cancelQueries({ queryKey: ['recommended-channels'] });

      // Snapshot the previous value
      const previousChannels = queryClient.getQueryData(['subscribed-channels']);

      // Optimistically update to the new value
      const recommendedChannels = queryClient.getQueryData(['recommended-channels']) as RssChannel[] | undefined;
      const channelToAdd = recommendedChannels?.find(ch => ch.channel_id === channelId);

      if (channelToAdd && previousChannels) {
        queryClient.setQueryData(['subscribed-channels'], (old: any) => {
          if (Array.isArray(old)) {
            return [...old, channelToAdd];
          }
          return old;
        });
      }

      return { previousChannels };
    },
    onError: (_err, _channelId, context) => {
      // If mutation fails, rollback
      if (context?.previousChannels) {
        queryClient.setQueryData(['subscribed-channels'], context.previousChannels);
      }
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async (channelId: number) => {
      await subscriptionApi.unsubscribe(channelId);
      return channelId;
    },
    onMutate: async (channelId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['subscribed-channels'] });

      // Snapshot the previous value
      const previousChannels = queryClient.getQueryData(['subscribed-channels']);

      // Optimistically update
      queryClient.setQueryData(['subscribed-channels'], (old: any) => {
        if (Array.isArray(old)) {
          return old.filter((ch: RssChannel) => ch.channel_id !== channelId);
        }
        return old;
      });

      return { previousChannels, channelId };
    },
    onError: (_err, _channelId, context) => {
      // If mutation fails, rollback
      if (context?.previousChannels) {
        queryClient.setQueryData(['subscribed-channels'], context.previousChannels);
      }
    },
    onSuccess: (_, channelId) => {
      if (selectedChannel === channelId) {
        setSelectedChannel(null);
      }
    },
  });

  // Add RSS feed mutation
  const addRssMutation = useMutation({
    mutationFn: async (url: string) => {
      const { data: channelId } = await rssApi.createChannel(url);
      await subscriptionApi.subscribe(channelId);
      return channelId;
    },
    onSuccess: async () => {
      // Refetch to get the new channel data
      await queryClient.refetchQueries({ queryKey: ['subscribed-channels'] });
      setAddDialogOpen(false);
      setRssUrl('');
    },
  });

  const handleAddRss = () => {
    if (rssUrl.trim()) {
      addRssMutation.mutate(rssUrl);
    }
  };

  const handleChannelSelect = (channelId: number) => {
    setSelectedChannel(channelId);
    setPage(1);
  };

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
          gap: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#ff8c00',
            fontFamily: '"Courier New", Courier, monospace',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          ▓▓▓ LOGIN REQUIRED ▓▓▓
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.1rem',
            color: '#808080',
            textAlign: 'center',
            lineHeight: 1.8,
          }}
        >
          RSS Feed 관리 기능을 사용하려면
          <br />
          로그인이 필요합니다
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 3,
            border: '2px solid rgba(255, 140, 0, 0.3)',
            backgroundColor: 'rgba(255, 140, 0, 0.05)',
            maxWidth: 400,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: '0.9rem',
              color: '#808080',
              textAlign: 'center',
              lineHeight: 1.8,
            }}
          >
            상단의 Login 버튼을 클릭하여
            <br />
            로그인 후 이용해주세요
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>RSS Feeds</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
        >
          Add RSS
        </Button>
      </Box>

      <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          TabIndicatorProps={{ sx: { bgcolor: '#000' } }}
        >
          <Tab label="My Feeds" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Recommended" sx={{ textTransform: 'none', fontWeight: 500 }} />
        </Tabs>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2 }}>
        {/* Channels List */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
                {tabValue === 0 ? 'Subscribed' : 'Recommended'}
              </Typography>
              {channelsLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              <List disablePadding>
                {(tabValue === 0 ? channels : recommendedChannels)?.map((channel: RssChannel) => (
                  <ListItem
                    key={channel.channel_id}
                    disablePadding
                    secondaryAction={
                      tabValue === 0 ? (
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            unsubscribeMutation.mutate(channel.channel_id!);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            subscribeMutation.mutate(channel.channel_id!);
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemButton
                      selected={selectedChannel === channel.channel_id}
                      onClick={() => handleChannelSelect(channel.channel_id!)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': {
                          bgcolor: '#f5f5f5',
                        },
                        '&:hover': {
                          bgcolor: '#fafafa',
                        },
                      }}
                    >
                      <Avatar
                        src={channel.channel_image_url}
                        sx={{ mr: 2, width: 32, height: 32 }}
                      >
                        {channel.channel_title?.[0]}
                      </Avatar>
                      <ListItemText
                        primary={channel.channel_title}
                        secondary={channel.channel_description}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          noWrap: true,
                          fontSize: '0.8rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* RSS Items */}
        <Box>
          {!selectedChannel ? (
            <Alert severity="info" sx={{ border: '1px solid #e0e0e0' }}>
              Select a channel to view items
            </Alert>
          ) : (
            <>
              {itemsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {rssItems?.map((item: RssItem) => (
                    <Card key={item.rss_id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Link
                          href={item.rss_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          color="inherit"
                          sx={{
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            display: 'block',
                            mb: 1,
                            '&:hover': { color: '#000' },
                          }}
                        >
                          {item.rss_title}
                        </Link>
                        {item.rss_description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                            dangerouslySetInnerHTML={{ __html: item.rss_description }}
                          />
                        )}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {item.rss_author && (
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              {item.rss_author}
                            </Typography>
                          )}
                          {item.rss_pub_date && (
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              • {new Date(item.rss_pub_date).toLocaleDateString()}
                            </Typography>
                          )}
                          {item.rss_rank !== undefined && item.rss_rank > 0 && (
                            <Chip
                              icon={<Star sx={{ fontSize: '0.9rem' }} />}
                              label={item.rss_rank}
                              size="small"
                              sx={{ height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  {rssItems && rssItems.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={10}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            '&.Mui-selected': {
                              bgcolor: '#000',
                              color: '#fff',
                              '&:hover': {
                                bgcolor: '#333',
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Add RSS Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddRss}
            variant="contained"
            disabled={addRssMutation.isPending}
          >
            {addRssMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
