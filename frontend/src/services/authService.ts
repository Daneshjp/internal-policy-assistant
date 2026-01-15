import { api } from './api';
import type { User, LoginRequest, LoginResponse, GoogleOAuthResponse } from '@/types/auth';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Logout (optional - mainly just clear local tokens)
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    }
  },

  /**
   * Google OAuth login
   */
  googleLogin: async (code: string): Promise<GoogleOAuthResponse> => {
    const response = await api.post<GoogleOAuthResponse>('/auth/google/callback', {
      code,
    });
    return response.data;
  },

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl: async (): Promise<string> => {
    const response = await api.get<{ auth_url: string }>('/auth/google');
    return response.data.auth_url;
  },
};
