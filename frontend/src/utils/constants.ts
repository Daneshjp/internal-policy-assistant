// User Roles
export const USER_ROLES = {
  INSPECTOR: 'inspector',
  TEAM_LEADER: 'team_leader',
  ENGINEER: 'engineer',
  RBI_AUDITOR: 'rbi_auditor',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Inspection Types
export const INSPECTION_TYPES = {
  ROUTINE: 'routine',
  STATUTORY: 'statutory',
  RBI: 'rbi',
  SHUTDOWN: 'shutdown',
  EMERGENCY: 'emergency',
} as const;

// Inspection Statuses
export const INSPECTION_STATUSES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
} as const;

// Finding Types
export const FINDING_TYPES = {
  DEFECT: 'defect',
  OBSERVATION: 'observation',
  RECOMMENDATION: 'recommendation',
  OK: 'ok',
} as const;

// Severity Levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Asset Types
export const ASSET_TYPES = {
  PRESSURE_VESSEL: 'pressure_vessel',
  PIPELINE: 'pipeline',
  TANK: 'tank',
  PUMP: 'pump',
  HEAT_EXCHANGER: 'heat_exchanger',
  VALVE: 'valve',
  OTHER: 'other',
} as const;

// Asset Criticality
export const ASSET_CRITICALITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Asset Status
export const ASSET_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  UNDER_MAINTENANCE: 'under_maintenance',
  DECOMMISSIONED: 'decommissioned',
} as const;

// Approval Stages
export const APPROVAL_STAGES = {
  INSPECTOR: 'inspector',
  ENGINEER: 'engineer',
  RBI: 'rbi',
  TEAM_LEADER: 'team_leader',
} as const;

// Approval Status
export const APPROVAL_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    GOOGLE_LOGIN: '/auth/google',
  },
  USERS: '/users',
  ASSETS: '/assets',
  INSPECTIONS: '/inspections',
  REPORTS: '/reports',
  APPROVALS: '/approvals',
  WORK_REQUESTS: '/work-requests',
  DASHBOARD: '/dashboard',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/heic'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;
