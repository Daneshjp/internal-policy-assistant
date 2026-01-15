import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionService } from '@/services/inspectionService';
import type {
  Inspection,
  InspectionCreate,
  InspectionUpdate,
  InspectionFinding,
} from '@/types/inspection';

/**
 * Hook to fetch paginated inspections
 */
export function useInspections(filters?: {
  status?: string;
  asset_id?: number;
  inspector_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['inspections', filters],
    queryFn: () => inspectionService.getInspections(filters),
  });
}

/**
 * Hook to fetch a single inspection by ID
 */
export function useInspection(id: number) {
  return useQuery({
    queryKey: ['inspections', id],
    queryFn: () => inspectionService.getInspection(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new inspection
 */
export function useCreateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InspectionCreate) => inspectionService.createInspection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });
}

/**
 * Hook to update an inspection
 */
export function useUpdateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InspectionUpdate }) =>
      inspectionService.updateInspection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspections', variables.id] });
    },
  });
}

/**
 * Hook to delete an inspection
 */
export function useDeleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inspectionService.deleteInspection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });
}

/**
 * Hook to start an inspection
 */
export function useStartInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inspectionService.startInspection(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspections', id] });
    },
  });
}

/**
 * Hook to complete an inspection
 */
export function useCompleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inspectionService.completeInspection(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspections', id] });
    },
  });
}

/**
 * Hook to fetch findings for an inspection
 */
export function useInspectionFindings(inspectionId: number) {
  return useQuery({
    queryKey: ['inspections', inspectionId, 'findings'],
    queryFn: () => inspectionService.getFindings(inspectionId),
    enabled: !!inspectionId,
  });
}

/**
 * Hook to add a finding to an inspection
 */
export function useAddFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inspectionId,
      finding,
    }: {
      inspectionId: number;
      finding: Omit<InspectionFinding, 'id' | 'created_at' | 'updated_at' | 'inspection_id'>;
    }) => inspectionService.addFinding(inspectionId, finding),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['inspections', variables.inspectionId, 'findings'],
      });
    },
  });
}

/**
 * Hook to upload photos for an inspection
 */
export function useUploadPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inspectionId, files }: { inspectionId: number; files: File[] }) =>
      inspectionService.uploadPhotos(inspectionId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['inspections', variables.inspectionId, 'findings'],
      });
    },
  });
}
