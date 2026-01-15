import { api } from './api';
import type { WorkRequest, WorkRequestCreate, WorkRequestUpdate, WorkRequestStats } from '@/types/work-request';
import type { PaginatedResponse } from '@/types';

export const workRequestService = {
  /**
   * Get all work requests with optional filters
   */
  getWorkRequests: async (filters?: {
    search?: string;
    status?: string;
    priority?: string;
    wr_type?: string;
    asset_id?: number;
    created_by_id?: number;
    assigned_to_me?: boolean;
    overdue?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<WorkRequest>> => {
    const response = await api.get<PaginatedResponse<WorkRequest>>('/work-requests', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get work request statistics
   */
  getStats: async (): Promise<WorkRequestStats> => {
    const response = await api.get<WorkRequestStats>('/work-requests/stats');
    return response.data;
  },

  /**
   * Get work request by ID
   */
  getWorkRequest: async (id: number): Promise<WorkRequest> => {
    const response = await api.get<WorkRequest>(`/work-requests/${id}`);
    return response.data;
  },

  /**
   * Create a new work request
   */
  createWorkRequest: async (data: WorkRequestCreate): Promise<WorkRequest> => {
    const response = await api.post<WorkRequest>('/work-requests', data);
    return response.data;
  },

  /**
   * Update a work request
   */
  updateWorkRequest: async (id: number, data: WorkRequestUpdate): Promise<WorkRequest> => {
    const response = await api.put<WorkRequest>(`/work-requests/${id}`, data);
    return response.data;
  },

  /**
   * Submit work request for approval
   */
  submitWorkRequest: async (id: number): Promise<WorkRequest> => {
    const response = await api.post<WorkRequest>(`/work-requests/${id}/submit`);
    return response.data;
  },

  /**
   * Approve work request
   */
  approveWorkRequest: async (id: number): Promise<WorkRequest> => {
    const response = await api.post<WorkRequest>(`/work-requests/${id}/approve`);
    return response.data;
  },

  /**
   * Reject work request
   */
  rejectWorkRequest: async (id: number): Promise<WorkRequest> => {
    const response = await api.post<WorkRequest>(`/work-requests/${id}/reject`);
    return response.data;
  },

  /**
   * Delete a work request
   */
  deleteWorkRequest: async (id: number): Promise<void> => {
    await api.delete(`/work-requests/${id}`);
  },
};
