import { BaseEntity, User } from './index';

export type WorkRequestPriority = 'low' | 'medium' | 'high' | 'critical';
export type WorkRequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type WorkRequestType = 'corrective' | 'preventive' | 'replacement' | 'investigation' | 'other';
export type SAPSyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'not_applicable';
export type WRDocumentType = 'attachment' | 'technical_drawing' | 'approval_document' | 'completion_certificate' | 'other';

export interface UserSimple {
  id: number;
  email: string;
  full_name: string | null;
}

export interface AssetSimple {
  id: number;
  name: string;
  asset_code: string;
}

export interface WRDocument {
  id: number;
  wr_id: number;
  document_type: WRDocumentType;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export interface WorkRequest extends BaseEntity {
  wr_number: string;
  title: string;
  description: string;
  priority: WorkRequestPriority;
  wr_type: WorkRequestType;
  status: WorkRequestStatus;
  sap_sync_status: SAPSyncStatus;
  sap_sync_at?: string;
  sap_error_message?: string;
  estimated_cost?: number;
  asset_id?: number;
  inspection_id?: number;
  finding_id?: number;
  report_id?: number;
  created_by_id?: number;
  approved_by_id?: number;
  created_by?: UserSimple;
  approved_by?: UserSimple;
  asset?: AssetSimple;
  documents?: WRDocument[];
}

export interface WorkRequestCreate {
  title: string;
  description: string;
  priority: WorkRequestPriority;
  wr_type: WorkRequestType;
  asset_id?: number;
  estimated_cost?: number;
  inspection_id?: number;
  finding_id?: number;
  report_id?: number;
}

export interface WorkRequestUpdate {
  title?: string;
  description?: string;
  priority?: WorkRequestPriority;
  wr_type?: WorkRequestType;
  status?: WorkRequestStatus;
  estimated_cost?: number;
  asset_id?: number;
  approved_by_id?: number;
}

export interface WorkRequestStats {
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_type: Record<string, number>;
  overdue: number;
  pending_approval: number;
  avg_resolution_days?: number;
}
