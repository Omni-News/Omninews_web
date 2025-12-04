import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Logout, Delete } from '@mui/icons-material';
import { authApi } from '../api/endpoints/auth';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const navigate = useNavigate();
  const { user, clearUser, updateTheme } = useAuthStore();
  const [pushNotifications, setPushNotifications] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  // Fetch user theme
  const { data: themeData } = useQuery({
    queryKey: ['user-theme'],
    queryFn: async () => {
      const { data } = await authApi.getTheme();
      return data;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_email');
      clearUser();
      setLogoutSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await authApi.deleteAccount();
    },
    onSuccess: () => {
      localStorage.clear();
      clearUser();
      navigate('/login');
    },
  });

  // Update theme mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (theme: string) => {
      await authApi.updateTheme({ theme });
    },
    onSuccess: (_, theme) => {
      updateTheme(theme);
    },
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await authApi.updateNotifications({
        user_notification_push: enabled,
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
    setDeleteDialogOpen(false);
  };

  const handleThemeChange = (event: any) => {
    updateThemeMutation.mutate(event.target.value);
  };

  const handleNotificationToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setPushNotifications(enabled);
    updateNotificationsMutation.mutate(enabled);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {logoutSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Logged out successfully. Redirecting...
        </Alert>
      )}

      {/* User Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Email"
                secondary={user?.email || 'Not available'}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Display Name"
                secondary={user?.displayName || 'Not set'}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          <List>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={themeData?.theme || 'paper'}
                  label="Theme"
                  onChange={handleThemeChange}
                >
                  <MenuItem value="paper">Paper</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={pushNotifications}
                    onChange={handleNotificationToggle}
                  />
                }
                label="Push Notifications"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              fullWidth
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
            <Divider />
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              fullWidth
            >
              Delete Account
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
            All your data, including subscriptions and folders, will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
