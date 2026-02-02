import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import conversationService from '../services/conversationService';
import { MessageFeedback } from '../types';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationService.getConversations(),
  });
}

export function useConversation(id: number | undefined) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationService.getConversation(id!),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => conversationService.createConversation(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => conversationService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) =>
      conversationService.sendMessage(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, feedback }: { messageId: number; feedback: MessageFeedback }) =>
      conversationService.updateFeedback(messageId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
}
