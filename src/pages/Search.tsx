import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Link,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { searchApi } from '../api/endpoints/search';
import type { SearchType, RssItem, RssChannel, NewsItem } from '../types';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [searchType, setSearchType] = useState<SearchType>('Accuracy');
  const [page, setPage] = useState(1);

  // Search RSS Items
  const {
    data: itemsResult,
    isLoading: itemsLoading,
    error: itemsError,
  } = useQuery({
    queryKey: ['search-items', activeQuery, searchType, page],
    queryFn: async () => {
      const { data } = await searchApi.searchItems(activeQuery, searchType, page);
      return data;
    },
    enabled: tabValue === 0 && !!activeQuery,
  });

  // Search Channels
  const {
    data: channelsResult,
    isLoading: channelsLoading,
    error: channelsError,
  } = useQuery({
    queryKey: ['search-channels', activeQuery, searchType, page],
    queryFn: async () => {
      const { data } = await searchApi.searchChannels(activeQuery, searchType, page);
      return data;
    },
    enabled: tabValue === 1 && !!activeQuery,
  });

  // Search External News
  const {
    data: newsResult,
    isLoading: newsLoading,
    error: newsError,
  } = useQuery({
    queryKey: ['search-news', activeQuery],
    queryFn: async () => {
      const { data } = await searchApi.searchNewsApi(
        activeQuery,
        20,
        searchType === 'Latest' ? 'date' : 'sim'
      );
      return data;
    },
    enabled: tabValue === 2 && !!activeQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery);
      setPage(1);
    }
  };

  const isLoading = itemsLoading || channelsLoading || newsLoading;
  const error = itemsError || channelsError || newsError;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Search
      </Typography>

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for news, RSS feeds, or channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={searchType}
              label="Sort By"
              onChange={(e) => setSearchType(e.target.value as SearchType)}
            >
              <MenuItem value="Accuracy">Accuracy</MenuItem>
              <MenuItem value="Popularity">Popularity</MenuItem>
              <MenuItem value="Latest">Latest</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" size="large">
            Search
          </Button>
        </Box>
      </form>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="RSS Items" />
        <Tab label="Channels" />
        <Tab label="External News" />
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Search failed. Please try again.
        </Alert>
      )}

      {/* No Results */}
      {!isLoading && !error && activeQuery && (
        <>
          {/* RSS Items Results */}
          {tabValue === 0 && itemsResult && (
            <>
              {itemsResult.total_count !== undefined && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Found {itemsResult.total_count} results
                </Typography>
              )}
              {itemsResult.items && itemsResult.items.length === 0 ? (
                <Alert severity="info">No RSS items found for "{activeQuery}"</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {itemsResult.items?.map((item: RssItem) => (
                    <Box key={item.rss_id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            <Link
                              href={item.rss_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                              color="inherit"
                            >
                              {item.rss_title}
                            </Link>
                          </Typography>
                          {item.rss_description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              paragraph
                              dangerouslySetInnerHTML={{ __html: item.rss_description }}
                            />
                          )}
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {item.rss_author && (
                              <Chip label={item.rss_author} size="small" variant="outlined" />
                            )}
                            {item.rss_pub_date && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.rss_pub_date).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}

          {/* Channels Results */}
          {tabValue === 1 && channelsResult && (
            <>
              {channelsResult.total_count !== undefined && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Found {channelsResult.total_count} results
                </Typography>
              )}
              {channelsResult.channels && channelsResult.channels.length === 0 ? (
                <Alert severity="info">No channels found for "{activeQuery}"</Alert>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  {channelsResult.channels?.map((channel: RssChannel) => (
                    <Box key={channel.channel_id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            <Link
                              href={channel.channel_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                              color="inherit"
                            >
                              {channel.channel_title}
                            </Link>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {channel.channel_description}
                          </Typography>
                          {channel.channel_language && (
                            <Chip
                              label={channel.channel_language}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}

          {/* External News Results */}
          {tabValue === 2 && newsResult && (
            <>
              {newsResult.length === 0 ? (
                <Alert severity="info">No news found for "{activeQuery}"</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {newsResult.map((news: NewsItem, index: number) => (
                    <Box key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            <Link
                              href={news.news_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                              color="inherit"
                            >
                              <span dangerouslySetInnerHTML={{ __html: news.news_title || '' }} />
                            </Link>
                          </Typography>
                          {news.news_description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              paragraph
                              dangerouslySetInnerHTML={{ __html: news.news_description }}
                            />
                          )}
                          {news.news_pub_date && (
                            <Typography variant="caption" color="text.secondary">
                              {news.news_pub_date}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Initial State */}
      {!activeQuery && (
        <Alert severity="info">
          Enter a search query to find RSS items, channels, or external news
        </Alert>
      )}
    </Box>
  );
}
