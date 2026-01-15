import api from './api';
import type {
  Team,
  TeamCreate,
  TeamUpdate,
  TeamMember,
  TeamMemberCreate,
  TeamAssignment,
  TeamAssignmentCreate,
  TeamAssignmentUpdate,
  InspectorAvailability,
  InspectorAvailabilityCreate,
  TeamStats,
} from '@/types/team';

export const teamService = {
  // Teams
  getTeams: async (filters?: {
    is_active?: boolean;
    specialization?: string;
  }): Promise<Team[]> => {
    const response = await api.get<Team[]>('/teams', { params: filters });
    return response.data;
  },

  getTeam: async (id: number): Promise<Team> => {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (data: TeamCreate): Promise<Team> => {
    const response = await api.post<Team>('/teams', data);
    return response.data;
  },

  updateTeam: async (id: number, data: TeamUpdate): Promise<Team> => {
    const response = await api.put<Team>(`/teams/${id}`, data);
    return response.data;
  },

  deleteTeam: async (id: number): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },

  getTeamStats: async (id: number): Promise<TeamStats> => {
    const response = await api.get<TeamStats>(`/teams/${id}/stats`);
    return response.data;
  },

  // Team Members
  getTeamMembers: async (teamId: number): Promise<TeamMember[]> => {
    const response = await api.get<TeamMember[]>(`/teams/${teamId}/members`);
    return response.data;
  },

  addTeamMember: async (data: TeamMemberCreate): Promise<TeamMember> => {
    const response = await api.post<TeamMember>('/teams/members', data);
    return response.data;
  },

  removeTeamMember: async (id: number): Promise<void> => {
    await api.delete(`/teams/members/${id}`);
  },

  updateTeamMemberRole: async (
    id: number,
    role: TeamMember['role_in_team']
  ): Promise<TeamMember> => {
    const response = await api.put<TeamMember>(`/teams/members/${id}/role`, {
      role_in_team: role,
    });
    return response.data;
  },

  // Team Assignments
  getTeamAssignments: async (filters?: {
    team_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<TeamAssignment[]> => {
    const response = await api.get<TeamAssignment[]>('/teams/assignments', {
      params: filters,
    });
    return response.data;
  },

  getTeamAssignment: async (id: number): Promise<TeamAssignment> => {
    const response = await api.get<TeamAssignment>(`/teams/assignments/${id}`);
    return response.data;
  },

  createTeamAssignment: async (
    data: TeamAssignmentCreate
  ): Promise<TeamAssignment> => {
    const response = await api.post<TeamAssignment>('/teams/assignments', data);
    return response.data;
  },

  updateTeamAssignment: async (
    id: number,
    data: TeamAssignmentUpdate
  ): Promise<TeamAssignment> => {
    const response = await api.put<TeamAssignment>(
      `/teams/assignments/${id}`,
      data
    );
    return response.data;
  },

  deleteTeamAssignment: async (id: number): Promise<void> => {
    await api.delete(`/teams/assignments/${id}`);
  },

  acceptAssignment: async (id: number): Promise<TeamAssignment> => {
    const response = await api.post<TeamAssignment>(
      `/teams/assignments/${id}/accept`
    );
    return response.data;
  },

  rejectAssignment: async (
    id: number,
    reason: string
  ): Promise<TeamAssignment> => {
    const response = await api.post<TeamAssignment>(
      `/teams/assignments/${id}/reject`,
      { reason }
    );
    return response.data;
  },

  // Inspector Availability
  getInspectorAvailability: async (
    inspectorId: number,
    dateFrom: string,
    dateTo: string
  ): Promise<InspectorAvailability[]> => {
    const response = await api.get<InspectorAvailability[]>(
      `/teams/inspectors/${inspectorId}/availability`,
      { params: { date_from: dateFrom, date_to: dateTo } }
    );
    return response.data;
  },

  setInspectorAvailability: async (
    inspectorId: number,
    data: InspectorAvailabilityCreate
  ): Promise<InspectorAvailability> => {
    const response = await api.post<InspectorAvailability>(
      `/teams/inspectors/${inspectorId}/availability`,
      data
    );
    return response.data;
  },

  updateInspectorAvailability: async (
    id: number,
    data: InspectorAvailabilityCreate
  ): Promise<InspectorAvailability> => {
    const response = await api.put<InspectorAvailability>(
      `/teams/availability/${id}`,
      data
    );
    return response.data;
  },

  deleteInspectorAvailability: async (id: number): Promise<void> => {
    await api.delete(`/teams/availability/${id}`);
  },
};
