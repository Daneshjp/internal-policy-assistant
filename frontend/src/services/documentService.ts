import api from './api';
import { Document, DocumentUpload, PaginatedResponse, DocumentStatus } from '../types';

export interface DocumentFilters {
  category_id?: number;
  status?: DocumentStatus;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface DocumentUpdateData {
  title?: string;
  description?: string;
  category_id?: number;
  status?: DocumentStatus;
}

/**
 * Get paginated list of documents with optional filters
 */
export async function getDocuments(filters: DocumentFilters = {}): Promise<PaginatedResponse<Document>> {
  const params = new URLSearchParams();

  if (filters.category_id) {
    params.append('category_id', filters.category_id.toString());
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.per_page) {
    params.append('per_page', filters.per_page.toString());
  }

  const response = await api.get(`/documents?${params.toString()}`);
  return response.data;
}

/**
 * Get a single document by ID
 */
export async function getDocument(id: number): Promise<Document> {
  const response = await api.get(`/documents/${id}`);
  return response.data;
}

/**
 * Upload a new document
 */
export async function uploadDocument(data: DocumentUpload): Promise<Document> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('title', data.title);

  if (data.description) {
    formData.append('description', data.description);
  }
  if (data.category_id) {
    formData.append('category_id', data.category_id.toString());
  }

  const response = await api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Update an existing document
 */
export async function updateDocument(id: number, data: DocumentUpdateData): Promise<Document> {
  const response = await api.put(`/documents/${id}`, data);
  return response.data;
}

/**
 * Delete a document
 */
export async function deleteDocument(id: number): Promise<void> {
  await api.delete(`/documents/${id}`);
}

/**
 * Download a document file
 */
export async function downloadDocument(id: number, filename: string): Promise<void> {
  const response = await api.get(`/documents/${id}/download`, {
    responseType: 'blob',
  });

  // Create a download link and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
