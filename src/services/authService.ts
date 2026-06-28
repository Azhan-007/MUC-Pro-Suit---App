import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { apiClient } from './api';

// ─────────────────────────────────────────────
// Zod schemas
// ─────────────────────────────────────────────
export const LoginSchema = z.object({
  registerNumber: z.string().min(3, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─────────────────────────────────────────────
// Auth Service — stubs ready for real Fastify API
// ─────────────────────────────────────────────
export const authService = {
  async login(input: LoginInput) {
    // TODO: Replace with real endpoint when backend is ready
    // const { data } = await apiClient.post('/auth/login', input);
    // await SecureStore.setItemAsync('access_token', data.accessToken);
    // await SecureStore.setItemAsync('refresh_token', data.refreshToken);
    // return data.student;

    // Mock — validates against hardcoded credentials
    if (input.registerNumber === 'MU202401' && input.password === 'password123') {
      await SecureStore.setItemAsync('access_token', 'mock_access_token');
      await SecureStore.setItemAsync('refresh_token', 'mock_refresh_token');
      return { success: true };
    }
    throw new Error('Invalid Username or Password. Please try again.');
  },

  async logout() {
    // TODO: await apiClient.post('/auth/logout');
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },

  async refreshToken() {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    await SecureStore.setItemAsync('access_token', data.accessToken);
    return data.accessToken;
  },
};
