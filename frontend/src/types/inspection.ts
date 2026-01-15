import { BaseEntity } from './index';

export type InspectionType = 'routine' | 'statutory' | 'rbi' | 'shutdown' | 'emergency';
export type InspectionStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type FindingType = 'defect' | 'observation' | 'recommendation' | 'ok';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Inspection extends BaseEntity {
  planned_inspection_id: number;
  asset_id: number;
  inspection_type: InspectionType;
  inspection_date: string;
  status: InspectionStatus;
  primary_inspector_id: number;
  secondary_inspector_ids?: number[];
  actual_start_time?: string;
  actual_end_time?: string;
  weather_conditions?: string;
  inspection_notes?: string;
}

export interface InspectionFinding extends BaseEntity {
  inspection_id: number;
  finding_type: FindingType;
  severity: Severity;
  description: string;
  location_on_asset: string;
  photos: string[];
  measurements?: Record<string, unknown>;
  corrective_action_required: boolean;
  corrective_action_description?: string;
  corrective_action_deadline?: string;
}

export interface InspectionCreate {
  planned_inspection_id: number;
  asset_id: number;
  inspection_type: InspectionType;
  inspection_date: string;
  status?: InspectionStatus;
  secondary_inspector_ids?: number[];
  inspection_notes?: string;
}

export interface InspectionUpdate {
  inspection_type?: InspectionType;
  inspection_date?: string;
  status?: InspectionStatus;
  actual_start_time?: string;
  actual_end_time?: string;
  weather_conditions?: string;
  inspection_notes?: string;
}

// AI Prediction Types
export type ConsequenceLevel = 'low' | 'medium' | 'high' | 'critical';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SensorData {
  id: number;
  inspection_id: number;
  pressure?: number;
  temperature?: number;
  wall_thickness?: number;
  corrosion_rate?: number;
  vibration?: number;
  flow_rate?: number;
  notes?: string;
  recorded_at: string;
  recorded_by_id?: number;
  created_at: string;
  updated_at: string;
}

export interface FailurePrediction {
  id: number;
  sensor_data_id: number;
  inspection_id: number;
  probability_of_failure: number;
  consequence_of_failure: ConsequenceLevel;
  confidence_score: number;
  risk_score: number;
  recommended_action?: string;
  priority: PriorityLevel;
  model_version: string;
  prediction_timestamp: string;
}

export interface AIAssessment {
  sensor_data: SensorData;
  prediction: FailurePrediction;
}

export interface SensorDataInput {
  pressure?: number;
  temperature?: number;
  wall_thickness?: number;
  corrosion_rate?: number;
  vibration?: number;
  flow_rate?: number;
  notes?: string;
}
