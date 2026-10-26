import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

function getApiUrl(): string {
  // 1. Explicit env var takes highest priority
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // 2. Auto-detect from Expo dev server host (works in Expo Go & dev builds)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3001/api/v1`;
  }
  // 3. Fallback for production builds — points to live cloud backend
  return 'https://muc-backend.onrender.com/api/v1';
}

const API_URL = getApiUrl();

// Log the resolved URL in dev for debugging
if (__DEV__) {
  console.log('[API] Base URL:', API_URL);
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 60000,
});

// Attach JWT token on every request
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track whether a refresh is in progress to avoid duplicate refreshes
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Avoid multiple concurrent refresh attempts
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
          try {
            const refreshToken = await SecureStore.getItemAsync('refresh_token');
            if (!refreshToken) return null;
            const { data } = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
              clientType: 'MOBILE',
            });
            await SecureStore.setItemAsync('access_token', data.accessToken);
            if (data.refreshToken) {
              await SecureStore.setItemAsync('refresh_token', data.refreshToken);
            }
            return data.accessToken;
          } catch {
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            return null;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();
      }

      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
