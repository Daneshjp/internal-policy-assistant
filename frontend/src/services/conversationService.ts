import api from './api';
import { Conversation, Message, MessageFeedback } from '../types';

export interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
}

export const conversationService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/conversations');
    return response.data;
  },

  async getConversation(id: number): Promise<Conversation> {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  async createConversation(title?: string): Promise<Conversation> {
    const response = await api.post('/conversations', { title });
    return response.data;
  },

  async deleteConversation(id: number): Promise<void> {
    await api.delete(`/conversations/${id}`);
  },

  async sendMessage(conversationId: number, content: string): Promise<SendMessageResponse> {
    const response = await api.post(`/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  async updateFeedback(messageId: number, feedback: MessageFeedback): Promise<Message> {
    const response = await api.put(`/messages/${messageId}/feedback`, { feedback });
    return response.data;
  },
};

export default conversationService;
