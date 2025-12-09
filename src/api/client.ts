import axios from "axios";
import type { RefreshTokenResponse } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:1027/v1/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      const userEmail = localStorage.getItem("user_email");

      if (refreshToken && userEmail) {
        try {
          const { data } = await axios.post<RefreshTokenResponse>(
            `${API_BASE_URL}/user/refresh-token`,
            {
              token: refreshToken,
              email: userEmail,
            },
          );

          localStorage.setItem("access_token", data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear storage and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_email");
          window.location.href = "/omninews/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = "/omninews/login";
      }
    }

    return Promise.reject(error);
  },
);
