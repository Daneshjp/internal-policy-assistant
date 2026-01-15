import { api } from './api';
import type {
  RBIAssessment,
  RBIAssessmentCreate,
  RBIAssessmentUpdate,
  RiskMatrixData,
  RiskDistribution,
  RiskTrend
} from '@/types/rbi';
import type { PaginatedResponse } from '@/types';

export const rbiService = {
  /**
   * Get all RBI assessments with optional filters
   */
  getAssessments: async (filters?: {
    asset_id?: number;
    risk_level?: string;
    asset_type?: string;
    facility?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<RBIAssessment>> => {
    const response = await api.get<PaginatedResponse<RBIAssessment>>('/rbi/assessments', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get assessment by ID
   */
  getAssessment: async (id: number): Promise<RBIAssessment> => {
    const response = await api.get<RBIAssessment>(`/rbi/assessments/${id}`);
    return response.data;
  },

  /**
   * Create a new RBI assessment
   */
  createAssessment: async (data: RBIAssessmentCreate): Promise<RBIAssessment> => {
    const response = await api.post<RBIAssessment>('/rbi/assessments', data);
    return response.data;
  },

  /**
   * Update an RBI assessment
   */
  updateAssessment: async (id: number, data: RBIAssessmentUpdate): Promise<RBIAssessment> => {
    const response = await api.put<RBIAssessment>(`/rbi/assessments/${id}`, data);
    return response.data;
  },

  /**
   * Delete an RBI assessment
   */
  deleteAssessment: async (id: number): Promise<void> => {
    await api.delete(`/rbi/assessments/${id}`);
  },

  /**
   * Get risk matrix data
   */
  getRiskMatrix: async (): Promise<RiskMatrixData[]> => {
    const response = await api.get<RiskMatrixData[]>('/rbi/risk-matrix');
    return response.data;
  },

  /**
   * Get risk distribution
   */
  getRiskDistribution: async (): Promise<RiskDistribution> => {
    const response = await api.get<RiskDistribution>('/rbi/risk-distribution');
    return response.data;
  },

  /**
   * Get risk trends over time
   */
  getRiskTrends: async (days: number = 90): Promise<RiskTrend[]> => {
    const response = await api.get<RiskTrend[]>('/rbi/risk-trends', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get high-risk assets requiring attention
   */
  getHighRiskAssets: async (): Promise<RBIAssessment[]> => {
    const response = await api.get<RBIAssessment[]>('/rbi/high-risk-assets');
    return response.data;
  },

  /**
   * Get inspection recommendations based on risk
   */
  getInspectionRecommendations: async (): Promise<Array<{
    asset_id: number;
    asset_name: string;
    risk_level: string;
    recommended_date: string;
    reason: string;
  }>> => {
    const response = await api.get('/rbi/inspection-recommendations');
    return response.data;
  },
};
