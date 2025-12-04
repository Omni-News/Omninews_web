import { apiClient } from '../client';
import type {
  AuthResponse,
  DemoLoginRequest,
  LoginRequest,
  ThemeResponse,
  ThemeRequest,
  NotificationSettings,
} from '../../types';

export const authApi = {
  // Login with social provider
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/user/login', data),

  // Demo login for testing
  demoLogin: (data: DemoLoginRequest) =>
    apiClient.post<AuthResponse>('/user/demo_login', data),

  // Apple login
  appleLogin: (userSocialProviderId: string) =>
    apiClient.post<AuthResponse>('/user/apple/login', {
      user_social_provider_id: userSocialProviderId,
    }),

  // Verify access token
  verifyToken: () =>
    apiClient.get('/user/access-token'),

  // Logout
  logout: () =>
    apiClient.post('/user/logout'),

  // Delete account
  deleteAccount: () =>
    apiClient.delete('/user/delete'),

  // Update notification settings
  updateNotifications: (settings: NotificationSettings) =>
    apiClient.post('/user/notification', settings),

  // Get user theme
  getTheme: () =>
    apiClient.get<ThemeResponse>('/user/theme'),

  // Update user theme
  updateTheme: (theme: ThemeRequest) =>
    apiClient.post('/user/theme', theme),
};
