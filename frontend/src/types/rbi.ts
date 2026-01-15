import { BaseEntity } from './index';

export type RBIGuidelineCategory = 'corrosion' | 'mechanical' | 'structural' | 'safety' | 'environmental';
export type RBIAuditStatus = 'pending' | 'in_progress' | 'passed' | 'failed' | 'exception_granted';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RBIGuideline extends BaseEntity {
  guideline_code: string;
  category: RBIGuidelineCategory;
  title: string;
  description: string;
  compliance_criteria: string;
  is_active: boolean;
}

export interface RBIAudit extends BaseEntity {
  inspection_id: number;
  auditor_id: number;
  audit_date: string;
  status: RBIAuditStatus;
  compliance_score: number;
  passed_items: number;
  failed_items: number;
  total_items: number;
  notes?: string;
  completed_at?: string;
}

export interface RBIChecklistItem extends BaseEntity {
  audit_id: number;
  guideline_id: number;
  compliance_status: ComplianceStatus;
  evidence_urls: string[];
  notes?: string;
  checked_at?: string;
}

export interface RBIException extends BaseEntity {
  audit_id: number;
  checklist_item_id: number;
  reason: string;
  granted_by_id: number;
  expiry_date: string;
  is_active: boolean;
}

export interface RBIGuidelineCreate {
  guideline_code: string;
  category: RBIGuidelineCategory;
  title: string;
  description: string;
  compliance_criteria: string;
}

export interface RBIAuditCreate {
  inspection_id: number;
  audit_date: string;
}

export interface ChecklistItemUpdate {
  compliance_status: ComplianceStatus;
  evidence_urls?: string[];
  notes?: string;
}

// RBI Assessment Types
export interface RBIAssessment extends BaseEntity {
  asset_id: number;
  asset_name?: string;
  asset_type?: string;
  facility?: string;
  consequence_score: number;
  probability_score: number;
  risk_score: number;
  risk_level: RiskLevel;
  consequence_factors: ConsequenceFactors;
  probability_factors: ProbabilityFactors;
  assessment_date: string;
  next_inspection_date?: string;
  assessor_id: number;
  assessor_name?: string;
  notes?: string;
}

export interface ConsequenceFactors {
  safety: number; // 1-5
  environmental: number; // 1-5
  production: number; // 1-5
  financial: number; // 1-5
}

export interface ProbabilityFactors {
  corrosion_rate: number; // 1-5
  age: number; // 1-5
  operating_conditions: number; // 1-5
  maintenance_history: number; // 1-5
}

export interface RBIAssessmentCreate {
  asset_id: number;
  consequence_factors: ConsequenceFactors;
  probability_factors: ProbabilityFactors;
  notes?: string;
}

export interface RBIAssessmentUpdate {
  consequence_factors?: ConsequenceFactors;
  probability_factors?: ProbabilityFactors;
  notes?: string;
}

export interface RiskMatrixData {
  consequence: number;
  probability: number;
  count: number;
  assets: Array<{
    id: number;
    name: string;
    asset_type: string;
  }>;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface RiskTrend {
  date: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}
