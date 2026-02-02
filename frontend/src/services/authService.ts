import api from './api';
import { User, AuthTokens, RegisterData } from '../types';

export interface LoginResponse extends AuthTokens {
  user?: User;
}

export interface UpdateProfileData {
  full_name?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const { data } = await api.post<AuthTokens>('/auth/login', formData);
    return data;
  },

  /**
   * Register a new user
   */
  async register(registerData: RegisterData): Promise<User> {
    const { data } = await api.post<User>('/auth/register', {
      email: registerData.email,
      password: registerData.password,
      full_name: registerData.full_name,
    });
    return data;
  },

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  /**
   * Get the current authenticated user
   */
  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    const { data } = await api.patch<User>('/auth/me', profileData);
    return data;
  },

  /**
   * Change user password
   */
  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    await api.post('/auth/change-password', passwordData);
  },
};

export default authService;
