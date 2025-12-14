import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import LoginModal from './LoginModal';

const menuItems = [
  { text: 'Dashboard', path: '/news' },
  { text: 'Folders', path: '/folders' },
  { text: 'Settings', path: '/settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { isAuthenticated, user, clearUser, setUser } = useAuthStore();

  // Check localStorage on mount for existing session
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('user_email');

    // If we have tokens but authStore shows not authenticated, sync the state
    if (token && email && !isAuthenticated) {
      setUser({ email, displayName: email.split('@')[0] });
    }

    // If authStore shows authenticated but no tokens, clear the state
    if (isAuthenticated && !token) {
      clearUser();
    }
  }, [isAuthenticated, setUser, clearUser]);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    clearUser();
    handleClose();
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: '#1a1a1a',
          borderBottom: '3px solid #ff8c00',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: '#ff8c00',
                cursor: 'pointer',
                fontFamily: '"Courier New", Courier, monospace',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
              onClick={() => navigate('/news')}
            >
              OmniNews
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {menuItems.map((item) => (
                <Typography
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    cursor: 'pointer',
                    color: location.pathname === item.path ? '#ff8c00' : '#808080',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: '"Courier New", Courier, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    '&:hover': {
                      color: '#ff8c00',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {item.text}
                </Typography>
              ))}
            </Box>
          </Box>
          {isAuthenticated ? (
            <>
              <IconButton onClick={handleProfileClick} size="small">
                <Avatar
                  src={user?.photoUrl}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#0a0a0a',
                    border: '2px solid #ff8c00',
                    color: '#ff8c00',
                    fontWeight: 700,
                    fontFamily: '"Courier New", Courier, monospace',
                  }}
                >
                  {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    borderRadius: 0,
                    border: '2px solid #ff8c00',
                    backgroundColor: '#1a1a1a',
                  },
                }}
              >
                <MenuItem disabled sx={{ opacity: 1, fontWeight: 700, color: '#ff8c00' }}>
                  {user?.displayName || user?.email}
                </MenuItem>
                {menuItems.map((item) => (
                  <MenuItem key={item.path} onClick={() => handleNavigation(item.path)}>
                    {item.text}
                  </MenuItem>
                ))}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setLoginModalOpen(true)}
              sx={{
                borderColor: '#ff8c00',
                color: '#ff8c00',
                fontWeight: 700,
                fontFamily: '"Courier New", Courier, monospace',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                '&:hover': {
                  borderColor: '#ff8c00',
                  backgroundColor: 'rgba(255, 140, 0, 0.1)',
                },
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ py: 3 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>

      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </Box>
  );
}
