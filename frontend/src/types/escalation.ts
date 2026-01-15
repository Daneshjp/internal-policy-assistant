import { BaseEntity } from './index';
import { Severity } from './inspection';

export type EscalationLevel = 1 | 2 | 3;
export type EscalationStatus = 'open' | 'in_progress' | 'resolved' | 'escalated';

export interface Escalation extends BaseEntity {
  inspection_id: number;
  asset_id: number;
  asset_name: string;
  inspection_type: string;
  scheduled_date: string;
  actual_overdue_days: number;
  escalation_level: EscalationLevel;
  severity: Severity;
  assigned_to_id: number;
  assigned_to_name: string;
  status: EscalationStatus;
  notes?: string;
  last_reminder_sent?: string;
  resolution_date?: string;
}

export interface EscalationComment extends BaseEntity {
  escalation_id: number;
  user_id: number;
  user_name: string;
  comment: string;
}

export interface EscalationAction extends BaseEntity {
  escalation_id: number;
  user_id: number;
  user_name: string;
  action_type: 'reassigned' | 'reminder_sent' | 'escalated' | 'resolved' | 'note_added';
  details: string;
}

export interface EscalationStats {
  total_escalations: number;
  level_1: number;
  level_2: number;
  level_3: number;
  critical: number;
  resolved_this_week: number;
  average_resolution_days: number;
}

export interface EscalationFilters {
  level?: EscalationLevel;
  severity?: Severity;
  status?: EscalationStatus;
  assigned_to?: number;
  search?: string;
}

export interface EscalationReassign {
  new_inspector_id: number;
  reason?: string;
}

export interface EscalationNote {
  note: string;
}
