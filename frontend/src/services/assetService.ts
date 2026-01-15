import { api } from './api';
import type { Asset, AssetCreate, AssetUpdate } from '@/types/asset';
import type { PaginatedResponse } from '@/types';
import type { Inspection } from '@/types/inspection';

export const assetService = {
  /**
   * Get all assets with optional filters
   */
  getAssets: async (filters?: {
    asset_type?: string;
    criticality?: string;
    status?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Asset>> => {
    const response = await api.get<PaginatedResponse<Asset>>('/assets', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get asset by ID
   */
  getAsset: async (id: number): Promise<Asset> => {
    const response = await api.get<Asset>(`/assets/${id}`);
    return response.data;
  },

  /**
   * Create a new asset
   */
  createAsset: async (data: AssetCreate): Promise<Asset> => {
    const response = await api.post<Asset>('/assets', data);
    return response.data;
  },

  /**
   * Update an asset
   */
  updateAsset: async (id: number, data: AssetUpdate): Promise<Asset> => {
    const response = await api.put<Asset>(`/assets/${id}`, data);
    return response.data;
  },

  /**
   * Delete an asset
   */
  deleteAsset: async (id: number): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  /**
   * Get inspection history for an asset
   */
  getAssetInspectionHistory: async (id: number): Promise<Inspection[]> => {
    const response = await api.get<Inspection[]>(`/assets/${id}/history`);
    return response.data;
  },

  /**
   * Upload asset document
   */
  uploadDocument: async (
    assetId: number,
    file: File,
    documentType: string
  ): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await api.post<{ url: string }>(
      `/assets/${assetId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get asset documents
   */
  getAssetDocuments: async (
    assetId: number
  ): Promise<Array<{ id: number; document_type: string; file_name: string; file_url: string }>> => {
    const response = await api.get<
      Array<{ id: number; document_type: string; file_name: string; file_url: string }>
    >(`/assets/${assetId}/documents`);
    return response.data;
  },

  /**
   * Delete asset document
   */
  deleteDocument: async (assetId: number, documentId: number): Promise<void> => {
    await api.delete(`/assets/${assetId}/documents/${documentId}`);
  },
};
