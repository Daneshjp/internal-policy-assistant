// User types
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'employee';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Document types
export type DocumentStatus = 'processing' | 'active' | 'archived';

export interface Document {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentUpload {
  title: string;
  description?: string;
  category_id?: number;
  file: File;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: number | null;
  document_count: number;
  children?: Category[];
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  icon?: string;
  parent_id?: number | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  icon?: string;
}

// Dashboard types
export interface DashboardStats {
  total_documents: number;
  total_conversations: number;
  total_categories: number;
  total_users?: number;
}

export interface RecentConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface RecentDocument {
  id: number;
  title: string;
  category_name: string | null;
  created_at: string;
}

// Conversation types
export type MessageRole = 'user' | 'assistant';
export type MessageFeedback = 'helpful' | 'not_helpful' | null;

export interface SourceDocument {
  document_id: number;
  title: string;
  chunk_content: string;
  relevance_score: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  source_documents: SourceDocument[] | null;
  feedback: MessageFeedback;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  messages?: Message[];
  created_at: string;
  updated_at: string;
}

// Analytics types
export interface AnalyticsOverview {
  total_documents: number;
  total_conversations: number;
  total_questions: number;
  answered_percentage: number;
}

export interface TopQuestion {
  question: string;
  count: number;
  had_answer: boolean;
}

export interface PopularDocument {
  document_id: number;
  title: string;
  view_count: number;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  code?: string;
}
