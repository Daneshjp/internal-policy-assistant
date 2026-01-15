import { BaseEntity, User } from './index';

export interface UserManagement extends User {
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  password: string;
  role: string;
  department?: string;
  is_active: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  role?: string;
  department?: string;
  is_active?: boolean;
}

export interface ResetPasswordRequest {
  user_id: number;
}

export interface SystemSettings {
  email_settings: EmailSettings;
  notification_preferences: NotificationPreferences;
  inspection_defaults: InspectionDefaults;
  risk_thresholds: RiskThresholds;
  file_upload_limits: FileUploadLimits;
  session_timeout: number;
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_use_tls: boolean;
  from_email: string;
  from_name: string;
}

export interface NotificationPreferences {
  enable_email_notifications: boolean;
  enable_inspection_reminders: boolean;
  reminder_days_before: number;
  enable_overdue_alerts: boolean;
  enable_approval_notifications: boolean;
}

export interface InspectionDefaults {
  default_inspection_interval_months: number;
  default_inspection_types: string[];
  require_approval: boolean;
  auto_assign_teams: boolean;
}

export interface RiskThresholds {
  high_risk_threshold: number;
  medium_risk_threshold: number;
  low_risk_threshold: number;
  critical_risk_threshold: number;
  rbi_calculation_method: string;
}

export interface FileUploadLimits {
  max_file_size_mb: number;
  allowed_file_types: string[];
  max_files_per_upload: number;
}

export interface AuditLog extends BaseEntity {
  user_id: number;
  user_name: string;
  action_type: string;
  resource_type: string;
  resource_id?: number;
  description: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface SystemStatistics {
  system_health: SystemHealth;
  database_stats: DatabaseStats;
  api_usage: ApiUsage;
  storage_usage: StorageUsage;
  active_users: ActiveUsers;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime_hours: number;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  last_backup: string;
}

export interface DatabaseStats {
  total_tables: number;
  total_records: number;
  database_size_mb: number;
  connections: number;
  queries_per_second: number;
}

export interface ApiUsage {
  total_requests_today: number;
  average_response_time_ms: number;
  error_rate_percent: number;
  most_used_endpoints: Array<{
    endpoint: string;
    count: number;
  }>;
}

export interface StorageUsage {
  total_storage_gb: number;
  used_storage_gb: number;
  available_storage_gb: number;
  file_count: number;
  largest_files: Array<{
    filename: string;
    size_mb: number;
  }>;
}

export interface ActiveUsers {
  total_users: number;
  active_users_today: number;
  active_users_this_week: number;
  active_users_this_month: number;
  by_role: Array<{
    role: string;
    count: number;
  }>;
}

export interface DataExportRequest {
  export_type: 'all' | 'assets' | 'inspections' | 'users' | 'audit_logs';
  format: 'csv' | 'excel' | 'json';
  date_from?: string;
  date_to?: string;
}

export interface DataImportRequest {
  import_type: 'assets' | 'users';
  file: File;
  overwrite_existing: boolean;
}

export interface BackupRequest {
  include_files: boolean;
  compression: boolean;
}

export interface DataRetentionSettings {
  audit_log_retention_days: number;
  inspection_data_retention_years: number;
  user_activity_retention_days: number;
  auto_delete_old_data: boolean;
}

export interface AuditLogFilter {
  user_id?: number;
  action_type?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface UserFilter {
  role?: string;
  is_active?: boolean;
  department?: string;
  search?: string;
}
