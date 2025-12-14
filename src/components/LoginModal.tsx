import { useState } from 'react';
import {
  Dialog,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined } from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '../api/endpoints/auth';
import { useAuthStore } from '../store/authStore';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.demoLogin({
        user_email: email,
        user_password: password,
      });

      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_email', email);

      // Update auth store
      setUser({
        email,
        displayName: email.split('@')[0],
      });

      // Close modal
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google OAuth success, got access token');
      setError('');
      setLoading(true);

      try {
        // Fetch user info from Google
        console.log('Fetching user info from Google...');
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          console.error('Failed to fetch user info, status:', userInfoResponse.status);
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();
        console.log('Got user info:', userInfo.email);

        // Login with backend server
        console.log('Calling backend login API...');
        const { data } = await authApi.login({
          user_email: userInfo.email,
          user_display_name: userInfo.name,
          user_photo_url: userInfo.picture,
          user_social_login_provider: 'google',
          user_social_provider_id: userInfo.sub,
          user_platform: 'web',
        });

        console.log('Backend login successful');

        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_email', userInfo.email);

        // Update auth store
        setUser({
          email: userInfo.email,
          displayName: userInfo.name,
          photoUrl: userInfo.picture,
        });

        // Close modal
        onClose();
      } catch (err: any) {
        console.error('Google login error:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        });
        setError(err.response?.data?.message || 'Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      setError('Google login was cancelled or failed.');
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '2px solid #ff8c00',
          background: '#1a1a1a',
          backgroundImage: 'radial-gradient(circle, #222 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        },
      }}
    >
      <Box sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#ff8c00',
              fontFamily: '"Courier New", Courier, monospace',
              textTransform: 'uppercase',
            }}
          >
            ▓▓▓ LOGIN ▓▓▓
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
            Sign in to access your personalized RSS feeds
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 0,
              border: '2px solid #d32f2f',
              backgroundColor: '#1a1a1a',
            }}
          >
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #ff8c00',
            boxShadow: 'none',
            fontFamily: '"Courier New", Courier, monospace',
            '&:hover': {
              background: '#f8f9fa',
              boxShadow: '4px 4px 0px #ff8c00',
              transform: 'translate(-2px, -2px)',
            },
            '&:disabled': {
              background: '#f1f3f4',
              color: '#5f6368',
              opacity: 0.6,
            },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          </svg>
          Sign in with Google
        </Button>

        <Divider sx={{ my: 3, borderColor: '#333' }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <form onSubmit={handleDemoLogin}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined sx={{ color: '#ff8c00' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': {
                  borderColor: '#333',
                  borderWidth: '2px',
                },
                '&:hover fieldset': {
                  borderColor: '#ff8c00',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff8c00',
                },
              },
            }}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: '#ff8c00' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': {
                  borderColor: '#333',
                  borderWidth: '2px',
                },
                '&:hover fieldset': {
                  borderColor: '#ff8c00',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff8c00',
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontFamily: '"Courier New", Courier, monospace',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <Box
          sx={{
            mt: 3,
            p: 2,
            background: 'rgba(255, 140, 0, 0.1)',
            border: '2px solid rgba(255, 140, 0, 0.3)',
            borderRadius: 0,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
            Demo credentials available for reviewers
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}
