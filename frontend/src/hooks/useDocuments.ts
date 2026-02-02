import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  DocumentFilters,
  DocumentUpdateData,
} from '../services/documentService';
import { DocumentUpload, Document, PaginatedResponse } from '../types';

// Query keys for cache management
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: DocumentFilters) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
};

/**
 * Hook for fetching paginated list of documents
 */
export function useDocuments(filters: DocumentFilters = {}) {
  return useQuery<PaginatedResponse<Document>, Error>({
    queryKey: documentKeys.list(filters),
    queryFn: () => getDocuments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching a single document
 */
export function useDocument(id: number | undefined) {
  return useQuery<Document, Error>({
    queryKey: documentKeys.detail(id!),
    queryFn: () => getDocument(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for uploading a new document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation<Document, Error, DocumentUpload>({
    mutationFn: uploadDocument,
    onSuccess: () => {
      // Invalidate all document lists to refetch with new document
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

/**
 * Hook for updating an existing document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation<Document, Error, { id: number; data: DocumentUpdateData }>({
    mutationFn: ({ id, data }) => updateDocument(id, data),
    onSuccess: (updatedDocument) => {
      // Update the specific document in cache
      queryClient.setQueryData(documentKeys.detail(updatedDocument.id), updatedDocument);
      // Invalidate lists to ensure they're up to date
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

/**
 * Hook for deleting a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteDocument,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
