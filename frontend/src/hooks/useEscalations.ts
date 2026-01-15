import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { escalationService } from '@/services/escalationService';
import type {
  EscalationFilters,
  EscalationReassign,
  EscalationNote,
} from '@/types/escalation';

/**
 * Hook to fetch paginated escalations
 */
export function useEscalations(
  filters?: EscalationFilters & { page?: number; page_size?: number }
) {
  return useQuery({
    queryKey: ['escalations', filters],
    queryFn: () => escalationService.getEscalations(filters),
  });
}

/**
 * Hook to fetch a single escalation by ID
 */
export function useEscalation(id: number) {
  return useQuery({
    queryKey: ['escalations', id],
    queryFn: () => escalationService.getEscalation(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch escalation statistics
 */
export function useEscalationStats() {
  return useQuery({
    queryKey: ['escalations', 'stats'],
    queryFn: () => escalationService.getStats(),
  });
}

/**
 * Hook to fetch comments for an escalation
 */
export function useEscalationComments(escalationId: number) {
  return useQuery({
    queryKey: ['escalations', escalationId, 'comments'],
    queryFn: () => escalationService.getComments(escalationId),
    enabled: !!escalationId,
  });
}

/**
 * Hook to add a comment to an escalation
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escalationId, comment }: { escalationId: number; comment: string }) =>
      escalationService.addComment(escalationId, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['escalations', variables.escalationId, 'comments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['escalations', variables.escalationId, 'actions'],
      });
    },
  });
}

/**
 * Hook to fetch action history for an escalation
 */
export function useEscalationActions(escalationId: number) {
  return useQuery({
    queryKey: ['escalations', escalationId, 'actions'],
    queryFn: () => escalationService.getActions(escalationId),
    enabled: !!escalationId,
  });
}

/**
 * Hook to reassign an escalation
 */
export function useReassignEscalation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EscalationReassign }) =>
      escalationService.reassign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['escalations', variables.id, 'actions'] });
    },
  });
}

/**
 * Hook to send a reminder
 */
export function useSendReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => escalationService.sendReminder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', id] });
      queryClient.invalidateQueries({ queryKey: ['escalations', id, 'actions'] });
    },
  });
}

/**
 * Hook to resolve an escalation
 */
export function useResolveEscalation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      escalationService.resolve(id, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['escalations', variables.id, 'actions'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', 'stats'] });
    },
  });
}

/**
 * Hook to escalate to higher level
 */
export function useEscalateHigher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      escalationService.escalate(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['escalations', variables.id, 'actions'] });
      queryClient.invalidateQueries({ queryKey: ['escalations', 'stats'] });
    },
  });
}

/**
 * Hook to add a note to an escalation
 */
export function useAddNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EscalationNote }) =>
      escalationService.addNote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escalations', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['escalations', variables.id, 'actions'] });
    },
  });
}
