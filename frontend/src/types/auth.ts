import { BaseEntity } from './index';

export type UserRole = 'inspector' | 'team_leader' | 'engineer' | 'rbi_auditor' | 'admin';

export interface User extends BaseEntity {
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  department?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface GoogleOAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}
