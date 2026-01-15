// Base Entity Interface
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  detail: string;
  error_code?: string;
}

// Export all type modules
export * from './auth';
export * from './asset';
export * from './inspection';
export * from './approval';
export * from './planning';
export * from './team';
export * from './escalation';
