import { api } from './api';
import type {
  Escalation,
  EscalationStats,
  EscalationFilters,
  EscalationComment,
  EscalationAction,
  EscalationReassign,
  EscalationNote,
} from '@/types/escalation';
import type { PaginatedResponse } from '@/types';

/**
 * Service for managing escalations
 */
class EscalationService {
  private baseURL = '/escalations';

  /**
   * Get escalations with filters and pagination
   */
  async getEscalations(
    filters?: EscalationFilters & { page?: number; page_size?: number }
  ): Promise<PaginatedResponse<Escalation>> {
    const params = new URLSearchParams();

    if (filters?.level) params.append('level', filters.level.toString());
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());

    const response = await api.get<PaginatedResponse<Escalation>>(
      `${this.baseURL}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get a single escalation by ID
   */
  async getEscalation(id: number): Promise<Escalation> {
    const response = await api.get<Escalation>(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Get escalation statistics
   */
  async getStats(): Promise<EscalationStats> {
    const response = await api.get<EscalationStats>(`${this.baseURL}/stats`);
    return response.data;
  }

  /**
   * Get comments for an escalation
   */
  async getComments(escalationId: number): Promise<EscalationComment[]> {
    const response = await api.get<EscalationComment[]>(
      `${this.baseURL}/${escalationId}/comments`
    );
    return response.data;
  }

  /**
   * Add a comment to an escalation
   */
  async addComment(escalationId: number, comment: string): Promise<EscalationComment> {
    const response = await api.post<EscalationComment>(
      `${this.baseURL}/${escalationId}/comments`,
      { comment }
    );
    return response.data;
  }

  /**
   * Get action history for an escalation
   */
  async getActions(escalationId: number): Promise<EscalationAction[]> {
    const response = await api.get<EscalationAction[]>(
      `${this.baseURL}/${escalationId}/actions`
    );
    return response.data;
  }

  /**
   * Reassign an escalation
   */
  async reassign(escalationId: number, data: EscalationReassign): Promise<Escalation> {
    const response = await api.post<Escalation>(
      `${this.baseURL}/${escalationId}/reassign`,
      data
    );
    return response.data;
  }

  /**
   * Send a reminder for an escalation
   */
  async sendReminder(escalationId: number): Promise<void> {
    await api.post(`${this.baseURL}/${escalationId}/remind`);
  }

  /**
   * Mark an escalation as resolved
   */
  async resolve(escalationId: number, note?: string): Promise<Escalation> {
    const response = await api.post<Escalation>(
      `${this.baseURL}/${escalationId}/resolve`,
      { note }
    );
    return response.data;
  }

  /**
   * Escalate to higher level
   */
  async escalate(escalationId: number, reason: string): Promise<Escalation> {
    const response = await api.post<Escalation>(
      `${this.baseURL}/${escalationId}/escalate`,
      { reason }
    );
    return response.data;
  }

  /**
   * Add a note to an escalation
   */
  async addNote(escalationId: number, data: EscalationNote): Promise<Escalation> {
    const response = await api.post<Escalation>(
      `${this.baseURL}/${escalationId}/notes`,
      data
    );
    return response.data;
  }
}

export const escalationService = new EscalationService();
