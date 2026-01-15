import { useMutation, useQuery } from '@tanstack/react-query';
import { inspectionService } from '@/services/inspectionService';
import type { AIAssessment, SensorDataInput } from '@/types/inspection';

/**
 * Hook for generating AI-powered failure predictions.
 * Uses TanStack Query mutation for real-time predictions.
 */
export function useGenerateAIPrediction() {
  return useMutation({
    mutationFn: ({
      inspectionId,
      sensorData,
    }: {
      inspectionId: number;
      sensorData: SensorDataInput;
    }): Promise<AIAssessment> => {
      return inspectionService.generateAIAssessment(inspectionId, sensorData);
    },
  });
}

/**
 * Hook for fetching the latest AI assessment for an inspection.
 * Uses TanStack Query for caching and automatic refetching.
 *
 * @param inspectionId - The ID of the inspection
 * @param enabled - Whether the query should run (default: true)
 */
export function useLatestAIPrediction(inspectionId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['ai-assessment', inspectionId],
    queryFn: () => inspectionService.getLatestAIAssessment(inspectionId),
    enabled: !!inspectionId && enabled,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
