import { BaseEntity } from './index';

// Annual Plan Types
export interface AnnualPlan extends BaseEntity {
  year: number;
  title?: string;
  description: string;
  total_inspections: number;
  target_inspections?: number; // Keep for backward compatibility
  total_budget?: number; // Optional since backend doesn't provide it
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'in_progress' | 'completed';
  created_by_id: number;
  approved_by_id?: number;
  approved_by?: number;
  approved_at?: string;
}

export interface AnnualPlanCreate {
  year: number;
  description: string;
  target_inspections: number;
  total_budget: number;
}

export interface AnnualPlanUpdate {
  description?: string;
  target_inspections?: number;
  total_budget?: number;
  status?: AnnualPlan['status'];
}

// Quarterly Plan Types
export interface QuarterlyPlan extends BaseEntity {
  annual_plan_id: number;
  quarter: 1 | 2 | 3 | 4;
  target_inspections: number;
  status: 'draft' | 'active' | 'completed';
  start_date: string;
  end_date: string;
}

// Monthly Plan Types
export interface MonthlyPlan extends BaseEntity {
  quarterly_plan_id: number;
  month: number;
  year: number;
  target_inspections: number;
  status: 'draft' | 'active' | 'completed';
  start_date: string;
  end_date: string;
}

// Planned Inspection Types
export interface PlannedInspection extends BaseEntity {
  monthly_plan_id: number;
  asset_id: number;
  inspection_type: 'routine' | 'statutory' | 'rbi' | 'shutdown' | 'emergency';
  planned_date: string;
  assigned_inspector_id?: number;
  status: 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration_hours: number;
  notes?: string;
  actual_inspection_id?: number;
}

export interface PlannedInspectionCreate {
  monthly_plan_id: number;
  asset_id: number;
  inspection_type: PlannedInspection['inspection_type'];
  planned_date: string;
  priority: PlannedInspection['priority'];
  estimated_duration_hours: number;
  notes?: string;
}

export interface PlannedInspectionUpdate {
  planned_date?: string;
  assigned_inspector_id?: number;
  status?: PlannedInspection['status'];
  priority?: PlannedInspection['priority'];
  estimated_duration_hours?: number;
  notes?: string;
}

// Planning Statistics
export interface PlanningStats {
  total_planned: number;
  completed: number;
  in_progress: number;
  overdue: number;
  completion_rate: number;
}

// Wizard Step Data
export interface PlanWizardData {
  year: number;
  description: string;
  total_budget: number;
  target_inspections: number;
}
