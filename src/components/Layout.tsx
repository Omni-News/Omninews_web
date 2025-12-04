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
} from '@mui/material';
import { useState } from 'react';

const menuItems = [
  { text: 'Dashboard', path: '/news' },
  { text: 'Folders', path: '/folders' },
  { text: 'Settings', path: '/settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
          <IconButton onClick={handleProfileClick} size="small">
            <Avatar sx={{
              width: 32,
              height: 32,
              bgcolor: '#0a0a0a',
              border: '2px solid #ff8c00',
              color: '#ff8c00',
              fontWeight: 700,
              fontFamily: '"Courier New", Courier, monospace',
            }}>U</Avatar>
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
          >
            {menuItems.map((item) => (
              <MenuItem key={item.path} onClick={() => handleNavigation(item.path)}>
                {item.text}
              </MenuItem>
            ))}
            <MenuItem onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ py: 3 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
