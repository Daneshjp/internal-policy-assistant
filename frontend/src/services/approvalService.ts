import { api } from './api';
import type {
  ApprovalWorkflow,
  ApprovalAction,
  PendingApprovalItem,
} from '@/types/approval';
import type { PaginatedResponse } from '@/types';

interface GetApprovalsParams {
  status?: string;
  severity?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export const approvalService = {
  /**
   * Get all pending approvals with optional filters
   */
  getApprovals: async (params?: GetApprovalsParams): Promise<PaginatedResponse<PendingApprovalItem>> => {
    const response = await api.get<PaginatedResponse<PendingApprovalItem>>('/approvals', {
      params,
    });
    return response.data;
  },

  /**
   * Get approval workflow by ID
   */
  getWorkflow: async (workflowId: number): Promise<ApprovalWorkflow> => {
    const response = await api.get<ApprovalWorkflow>(`/approvals/${workflowId}`);
    return response.data;
  },

  /**
   * Approve an inspection report
   */
  approve: async (workflowId: number, comments?: string): Promise<ApprovalWorkflow> => {
    const response = await api.post<ApprovalWorkflow>(`/approvals/${workflowId}/approve`, {
      comments,
    });
    return response.data;
  },

  /**
   * Reject an inspection report
   */
  reject: async (workflowId: number, comments: string): Promise<ApprovalWorkflow> => {
    const response = await api.post<ApprovalWorkflow>(`/approvals/${workflowId}/reject`, {
      comments,
    });
    return response.data;
  },
};
