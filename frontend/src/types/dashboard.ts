export interface KPIMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  unit?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface InspectionStats {
  total_inspections: number;
  completed: number;
  in_progress: number;
  pending: number;
  completion_rate: number;
  avg_completion_time: number;
}

export interface FindingStats {
  total_findings: number;
  by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  by_type: {
    defect: number;
    observation: number;
    recommendation: number;
    ok: number;
  };
}

export interface ApprovalStats {
  pending_approvals: number;
  approved_today: number;
  rejected_today: number;
  avg_approval_time: number;
}

export interface ComplianceStats {
  overall_score: number;
  passed_audits: number;
  failed_audits: number;
  exceptions: number;
}

export interface InspectorPerformance {
  inspector_id: number;
  inspector_name: string;
  inspections_completed: number;
  avg_completion_time: number;
  findings_detected: number;
  quality_score: number;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'list';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data?: Record<string, unknown>;
}

export interface DashboardLayout {
  user_id: number;
  widgets: DashboardWidget[];
}
