import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { apiClient } from '../lib/apiClient';

// ─────────────────────────────────────────────
// Zod schemas
// ─────────────────────────────────────────────
export const LoginSchema = z.object({
  registerNumber: z.string().min(3, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─────────────────────────────────────────────
// Auth Service
// ─────────────────────────────────────────────
export const authService = {
  async login(input: LoginInput) {
    const { data } = await apiClient.post('/auth/login', {
      identifier: input.registerNumber,
      password: input.password,
      clientType: 'MOBILE'
    });
    if (data.accessToken && data.refreshToken) {
      await SecureStore.setItemAsync('access_token', data.accessToken);
      await SecureStore.setItemAsync('refresh_token', data.refreshToken);
    }
    return { success: true, user: data.user || data.student || null };
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },

  async refreshToken() {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    const { data } = await apiClient.post('/auth/refresh', { refreshToken, clientType: 'MOBILE' });
    await SecureStore.setItemAsync('access_token', data.accessToken);
    return data.accessToken;
  },
};
