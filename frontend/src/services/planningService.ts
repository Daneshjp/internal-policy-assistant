import { api } from './api';
import type {
  AnnualPlan,
  AnnualPlanCreate,
  AnnualPlanUpdate,
  QuarterlyPlan,
  MonthlyPlan,
  PlannedInspection,
  PlannedInspectionCreate,
  PlannedInspectionUpdate,
  PlanningStats,
} from '@/types/planning';

export const planningService = {
  // Annual Plans
  getAnnualPlans: async (year?: number): Promise<AnnualPlan[]> => {
    const params = year ? { year } : {};
    const response = await api.get<AnnualPlan[]>('/plans/annual', { params });
    return response.data;
  },

  getAnnualPlan: async (id: number): Promise<AnnualPlan> => {
    const response = await api.get<AnnualPlan>(`/plans/annual/${id}`);
    return response.data;
  },

  createAnnualPlan: async (data: AnnualPlanCreate): Promise<AnnualPlan> => {
    const response = await api.post<AnnualPlan>('/plans/annual', data);
    return response.data;
  },

  updateAnnualPlan: async (
    id: number,
    data: AnnualPlanUpdate
  ): Promise<AnnualPlan> => {
    const response = await api.put<AnnualPlan>(`/plans/annual/${id}`, data);
    return response.data;
  },

  deleteAnnualPlan: async (id: number): Promise<void> => {
    await api.delete(`/plans/annual/${id}`);
  },

  approveAnnualPlan: async (id: number): Promise<AnnualPlan> => {
    const response = await api.post<AnnualPlan>(`/plans/annual/${id}/approve`);
    return response.data;
  },

  // Quarterly Plans
  getQuarterlyPlans: async (annualPlanId: number): Promise<QuarterlyPlan[]> => {
    const response = await api.get<QuarterlyPlan[]>(
      `/plans/annual/${annualPlanId}/quarterly`
    );
    return response.data;
  },

  getQuarterlyPlan: async (id: number): Promise<QuarterlyPlan> => {
    const response = await api.get<QuarterlyPlan>(`/plans/quarterly/${id}`);
    return response.data;
  },

  // Monthly Plans
  getMonthlyPlans: async (quarterlyPlanId: number): Promise<MonthlyPlan[]> => {
    const response = await api.get<MonthlyPlan[]>(
      `/plans/quarterly/${quarterlyPlanId}/monthly`
    );
    return response.data;
  },

  getMonthlyPlan: async (id: number): Promise<MonthlyPlan> => {
    const response = await api.get<MonthlyPlan>(`/plans/monthly/${id}`);
    return response.data;
  },

  // Planned Inspections
  getPlannedInspections: async (filters?: {
    monthly_plan_id?: number;
    status?: string;
    inspection_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PlannedInspection[]> => {
    const response = await api.get<PlannedInspection[]>('/plans/inspections', {
      params: filters,
    });
    return response.data;
  },

  getPlannedInspection: async (id: number): Promise<PlannedInspection> => {
    const response = await api.get<PlannedInspection>(`/plans/inspections/${id}`);
    return response.data;
  },

  createPlannedInspection: async (
    data: PlannedInspectionCreate
  ): Promise<PlannedInspection> => {
    const response = await api.post<PlannedInspection>(
      '/plans/inspections',
      data
    );
    return response.data;
  },

  updatePlannedInspection: async (
    id: number,
    data: PlannedInspectionUpdate
  ): Promise<PlannedInspection> => {
    const response = await api.put<PlannedInspection>(
      `/plans/inspections/${id}`,
      data
    );
    return response.data;
  },

  deletePlannedInspection: async (id: number): Promise<void> => {
    await api.delete(`/plans/inspections/${id}`);
  },

  assignInspector: async (
    id: number,
    inspectorId: number
  ): Promise<PlannedInspection> => {
    const response = await api.post<PlannedInspection>(
      `/plans/inspections/${id}/assign`,
      { inspector_id: inspectorId }
    );
    return response.data;
  },

  reschedulePlannedInspection: async (
    id: number,
    newDate: string
  ): Promise<PlannedInspection> => {
    const response = await api.post<PlannedInspection>(
      `/plans/inspections/${id}/reschedule`,
      { planned_date: newDate }
    );
    return response.data;
  },

  // Statistics
  getPlanningStats: async (year?: number): Promise<PlanningStats> => {
    const params = year ? { year } : {};
    const response = await api.get<PlanningStats>('/plans/stats', { params });
    return response.data;
  },
};
