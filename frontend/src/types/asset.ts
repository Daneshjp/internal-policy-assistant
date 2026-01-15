import { BaseEntity } from './index';

export type AssetType = 'pressure_vessel' | 'pipeline' | 'tank' | 'pump' | 'heat_exchanger' | 'valve' | 'other';
export type AssetCriticality = 'low' | 'medium' | 'high' | 'critical';
export type AssetStatus = 'active' | 'inactive' | 'under_maintenance' | 'decommissioned';

export interface Asset extends BaseEntity {
  asset_number: string;
  asset_name: string;
  asset_type: AssetType;
  description?: string;
  location: string;
  department: string;
  criticality: AssetCriticality;
  status: AssetStatus;
  installation_date?: string;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  specifications?: Record<string, unknown>;
  last_inspection_date?: string;
  next_inspection_date?: string;
}

export interface AssetCreate {
  asset_number: string;
  asset_name: string;
  asset_type: AssetType;
  description?: string;
  location: string;
  department: string;
  criticality: AssetCriticality;
  status?: AssetStatus;
  installation_date?: string;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  specifications?: Record<string, unknown>;
}

export interface AssetUpdate {
  asset_name?: string;
  asset_type?: AssetType;
  description?: string;
  location?: string;
  department?: string;
  criticality?: AssetCriticality;
  status?: AssetStatus;
  specifications?: Record<string, unknown>;
}
