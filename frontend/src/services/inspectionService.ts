import { api } from './api';
import type {
  Inspection,
  InspectionCreate,
  InspectionUpdate,
  InspectionFinding,
  AIAssessment,
  SensorDataInput,
} from '@/types/inspection';

export const inspectionService = {
  /**
   * Get all inspections with optional filters
   */
  getInspections: async (filters?: {
    status?: string;
    asset_id?: number;
    inspector_id?: number;
    date_from?: string;
    date_to?: string;
    skip?: number;
    limit?: number;
  }): Promise<Inspection[]> => {
    const response = await api.get<Inspection[]>('/inspections', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get inspection by ID
   */
  getInspection: async (id: number): Promise<Inspection> => {
    const response = await api.get<Inspection>(`/inspections/${id}`);
    return response.data;
  },

  /**
   * Create a new inspection
   */
  createInspection: async (data: InspectionCreate): Promise<Inspection> => {
    const response = await api.post<Inspection>('/inspections', data);
    return response.data;
  },

  /**
   * Update an inspection
   */
  updateInspection: async (id: number, data: InspectionUpdate): Promise<Inspection> => {
    const response = await api.put<Inspection>(`/inspections/${id}`, data);
    return response.data;
  },

  /**
   * Delete an inspection
   */
  deleteInspection: async (id: number): Promise<void> => {
    await api.delete(`/inspections/${id}`);
  },

  /**
   * Start an inspection
   */
  startInspection: async (id: number): Promise<Inspection> => {
    const response = await api.post<Inspection>(`/inspections/${id}/start`);
    return response.data;
  },

  /**
   * Complete an inspection
   */
  completeInspection: async (id: number): Promise<Inspection> => {
    const response = await api.post<Inspection>(`/inspections/${id}/complete`);
    return response.data;
  },

  /**
   * Get findings for an inspection
   */
  getFindings: async (inspectionId: number): Promise<InspectionFinding[]> => {
    const response = await api.get<InspectionFinding[]>(
      `/inspections/${inspectionId}/findings`
    );
    return response.data;
  },

  /**
   * Add a finding to an inspection
   */
  addFinding: async (
    inspectionId: number,
    finding: Omit<InspectionFinding, 'id' | 'created_at' | 'updated_at' | 'inspection_id'>
  ): Promise<InspectionFinding> => {
    const response = await api.post<InspectionFinding>(
      `/inspections/${inspectionId}/findings`,
      finding
    );
    return response.data;
  },

  /**
   * Upload photos for an inspection
   */
  uploadPhotos: async (inspectionId: number, files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<{ urls: string[] }>(
      `/inspections/${inspectionId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.urls;
  },

  /**
   * Generate AI-powered failure prediction from sensor data
   */
  generateAIAssessment: async (
    inspectionId: number,
    sensorData: SensorDataInput
  ): Promise<AIAssessment> => {
    const response = await api.post<AIAssessment>(
      `/inspections/${inspectionId}/ai-assessment`,
      sensorData
    );
    return response.data;
  },

  /**
   * Get latest AI assessment for an inspection
   */
  getLatestAIAssessment: async (inspectionId: number): Promise<AIAssessment> => {
    const response = await api.get<AIAssessment>(
      `/inspections/${inspectionId}/ai-assessment/latest`
    );
    return response.data;
  },

  /**
   * Manually trigger sensor polling for an inspection
   */
  pollSensors: async (inspectionId: number): Promise<AIAssessment> => {
    const response = await api.post<AIAssessment>(
      `/inspections/${inspectionId}/poll-sensors`
    );
    return response.data;
  },

  /**
   * Get sensor reading history for an inspection
   */
  getSensorHistory: async (inspectionId: number, limit?: number): Promise<AIAssessment[]> => {
    const response = await api.get<AIAssessment[]>(
      `/inspections/${inspectionId}/sensor-history`,
      { params: { limit: limit || 20 } }
    );
    return response.data;
  },
};
