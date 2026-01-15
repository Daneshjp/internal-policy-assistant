import { BaseEntity } from './index';

// Team Types
export interface Team extends BaseEntity {
  name: string;
  description: string;
  team_leader_id: number;
  specialization?: string;
  is_active: boolean;
}

export interface TeamCreate {
  name: string;
  description: string;
  team_leader_id: number;
  specialization?: string;
}

export interface TeamUpdate {
  name?: string;
  description?: string;
  team_leader_id?: number;
  specialization?: string;
  is_active?: boolean;
}

// Team Member Types
export interface TeamMember extends BaseEntity {
  team_id: number;
  user_id: number;
  role_in_team: 'leader' | 'inspector' | 'support';
  joined_at: string;
  is_active: boolean;
  // Populated from user
  user_name?: string;
  user_email?: string;
}

export interface TeamMemberCreate {
  team_id: number;
  user_id: number;
  role_in_team: TeamMember['role_in_team'];
}

// Team Assignment Types
export interface TeamAssignment extends BaseEntity {
  team_id: number;
  planned_inspection_id: number;
  assigned_at: string;
  assigned_by: number;
  status: 'unassigned' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  notes?: string;
  // Populated data
  team_name?: string;
  inspection_details?: {
    asset_name: string;
    inspection_type: string;
    planned_date: string;
  };
}

export interface TeamAssignmentCreate {
  team_id: number;
  planned_inspection_id: number;
  notes?: string;
}

export interface TeamAssignmentUpdate {
  status: TeamAssignment['status'];
  notes?: string;
}

// Inspector Availability Types
export interface InspectorAvailability extends BaseEntity {
  inspector_id: number;
  date: string;
  is_available: boolean;
  reason?: string;
}

export interface InspectorAvailabilityCreate {
  date: string;
  is_available: boolean;
  reason?: string;
}

// Team Statistics
export interface TeamStats {
  total_members: number;
  active_members: number;
  total_assignments: number;
  completed_assignments: number;
  pending_assignments: number;
  completion_rate: number;
}

// Assignment Board Column
export interface AssignmentBoardColumn {
  id: string;
  title: string;
  status: TeamAssignment['status'];
  assignments: TeamAssignment[];
}
