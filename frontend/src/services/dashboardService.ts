import api from './api';
import { DashboardStats, RecentConversation, RecentDocument } from '../types';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Try to get stats from the API
      const { data } = await api.get<DashboardStats>('/dashboard/stats');
      return data;
    } catch {
      // Return mock data if endpoint doesn't exist yet
      return {
        total_documents: 0,
        total_conversations: 0,
        total_categories: 0,
      };
    }
  },

  /**
   * Get recent conversations
   */
  async getRecentConversations(limit: number = 5): Promise<RecentConversation[]> {
    try {
      const { data } = await api.get<RecentConversation[]>('/conversations/recent', {
        params: { limit },
      });
      return data;
    } catch {
      // Return empty array if endpoint doesn't exist yet
      return [];
    }
  },

  /**
   * Get recent documents
   */
  async getRecentDocuments(limit: number = 5): Promise<RecentDocument[]> {
    try {
      const { data } = await api.get<RecentDocument[]>('/documents/recent', {
        params: { limit },
      });
      return data;
    } catch {
      // Return empty array if endpoint doesn't exist yet
      return [];
    }
  },
};

export default dashboardService;
