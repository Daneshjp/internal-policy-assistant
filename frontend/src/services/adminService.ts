import { api } from './api';
import type {
  UserManagement,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  SystemSettings,
  AuditLog,
  SystemStatistics,
  DataExportRequest,
  DataImportRequest,
  BackupRequest,
  DataRetentionSettings,
  AuditLogFilter,
  UserFilter,
} from '@/types/admin';

// User Management
export const adminService = {
  // Users
  async getUsers(filter?: UserFilter): Promise<UserManagement[]> {
    const params = new URLSearchParams();
    if (filter?.role) params.append('role', filter.role);
    if (filter?.is_active !== undefined) params.append('is_active', filter.is_active.toString());
    if (filter?.department) params.append('department', filter.department);
    if (filter?.search) params.append('search', filter.search);

    const response = await api.get<UserManagement[]>(`/admin/users?${params.toString()}`);
    return response.data;
  },

  async getUser(id: number): Promise<UserManagement> {
    const response = await api.get<UserManagement>(`/admin/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserRequest): Promise<UserManagement> {
    const response = await api.post<UserManagement>('/admin/users', data);
    return response.data;
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<UserManagement> {
    const response = await api.put<UserManagement>(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async toggleUserStatus(id: number): Promise<UserManagement> {
    const response = await api.post<UserManagement>(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string; temporary_password: string }> {
    const response = await api.post<{ message: string; temporary_password: string }>(
      `/admin/users/${data.user_id}/reset-password`
    );
    return response.data;
  },

  // System Settings
  async getSettings(): Promise<SystemSettings> {
    const response = await api.get<SystemSettings>('/admin/settings');
    return response.data;
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await api.put<SystemSettings>('/admin/settings', data);
    return response.data;
  },

  async testEmailSettings(data: { email: string }): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/admin/settings/test-email',
      data
    );
    return response.data;
  },

  // Audit Logs
  async getAuditLogs(filter?: AuditLogFilter, page = 1, limit = 50): Promise<{ logs: AuditLog[]; total: number }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filter?.user_id) params.append('user_id', filter.user_id.toString());
    if (filter?.action_type) params.append('action_type', filter.action_type);
    if (filter?.resource_type) params.append('resource_type', filter.resource_type);
    if (filter?.date_from) params.append('date_from', filter.date_from);
    if (filter?.date_to) params.append('date_to', filter.date_to);
    if (filter?.search) params.append('search', filter.search);

    const response = await api.get<{ logs: AuditLog[]; total: number }>(
      `/admin/audit-logs?${params.toString()}`
    );
    return response.data;
  },

  async exportAuditLogs(filter?: AuditLogFilter): Promise<Blob> {
    const params = new URLSearchParams();
    if (filter?.user_id) params.append('user_id', filter.user_id.toString());
    if (filter?.action_type) params.append('action_type', filter.action_type);
    if (filter?.resource_type) params.append('resource_type', filter.resource_type);
    if (filter?.date_from) params.append('date_from', filter.date_from);
    if (filter?.date_to) params.append('date_to', filter.date_to);

    const response = await api.get(`/admin/audit-logs/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Statistics
  async getStatistics(): Promise<SystemStatistics> {
    const response = await api.get<SystemStatistics>('/admin/statistics');
    return response.data;
  },

  // Data Management
  async exportData(request: DataExportRequest): Promise<Blob> {
    const response = await api.post('/admin/data/export', request, {
      responseType: 'blob',
    });
    return response.data;
  },

  async importData(request: DataImportRequest): Promise<{ success: boolean; message: string; imported_count: number }> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('import_type', request.import_type);
    formData.append('overwrite_existing', request.overwrite_existing.toString());

    const response = await api.post<{ success: boolean; message: string; imported_count: number }>(
      '/admin/data/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async createBackup(request: BackupRequest): Promise<Blob> {
    const response = await api.post('/admin/data/backup', request, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getRetentionSettings(): Promise<DataRetentionSettings> {
    const response = await api.get<DataRetentionSettings>('/admin/data/retention');
    return response.data;
  },

  async updateRetentionSettings(data: DataRetentionSettings): Promise<DataRetentionSettings> {
    const response = await api.put<DataRetentionSettings>('/admin/data/retention', data);
    return response.data;
  },

  async clearOldData(confirm: boolean): Promise<{ success: boolean; message: string; deleted_count: number }> {
    const response = await api.post<{ success: boolean; message: string; deleted_count: number }>(
      '/admin/data/clear-old',
      { confirm }
    );
    return response.data;
  },
};
