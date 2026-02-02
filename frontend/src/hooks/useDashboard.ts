import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch recent conversations
 */
export function useRecentConversations(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recentConversations', limit],
    queryFn: () => dashboardService.getRecentConversations(limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch recent documents
 */
export function useRecentDocuments(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recentDocuments', limit],
    queryFn: () => dashboardService.getRecentDocuments(limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}
