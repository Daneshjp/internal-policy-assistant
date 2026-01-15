import { BaseEntity } from './index';

export type ApprovalStage = 'inspector' | 'engineer' | 'rbi' | 'team_leader';
export type ApprovalStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';
export type StageStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'skipped';
export type CommentType = 'approval' | 'rejection' | 'request_changes' | 'general';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface ApprovalComment extends BaseEntity {
  stage_id: number;
  reviewer_id: number;
  comment: string;
  comment_type: CommentType;
}

export interface ApprovalStageRecord extends BaseEntity {
  workflow_id: number;
  stage_name: string;
  stage_order: number;
  reviewer_id?: number;
  status: StageStatus;
  comments?: string;
  reviewed_at?: string;
}

export interface ApprovalHistory extends BaseEntity {
  workflow_id: number;
  action: string;
  performed_by_id?: number;
  stage_name?: string;
  comments?: string;
}

export interface ApprovalWorkflow extends BaseEntity {
  report_id: number;
  current_stage?: ApprovalStage;
  status: ApprovalStatus;
  stages: ApprovalStageRecord[];
  history: ApprovalHistory[];
}

export interface ApprovalAction {
  action: 'approve' | 'reject';
  comments?: string;
}

export interface PendingApprovalItem {
  workflow_id: number;
  report_id: number;
  report_number: string;
  inspection_id: number;
  asset_id?: number;
  asset_name?: string;
  inspection_date?: string;
  inspection_type?: string;
  inspector_id?: number;
  inspector_name?: string;
  findings_count: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  current_stage?: ApprovalStage;
  workflow_status: ApprovalStatus;
  submitted_at?: string;
  created_at: string;
}
