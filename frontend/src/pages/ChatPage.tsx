import { useEffect } from 'react';
import { Box, Flex, Heading, Button, useDisclosure, useToast } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ConversationList } from '../components/chat/ConversationList';
import { GradientButton } from '../components/ui/GradientButton';
import {
  useConversations,
  useConversation,
  useCreateConversation,
  useDeleteConversation,
  useSendMessage,
  useUpdateFeedback,
} from '../hooks/useChat';

export function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const activeId = conversationId ? parseInt(conversationId) : undefined;

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: activeConversation, isLoading: conversationLoading } = useConversation(activeId);
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const sendMessage = useSendMessage();
  const updateFeedback = useUpdateFeedback();

  const handleNewConversation = async () => {
    try {
      const conversation = await createConversation.mutateAsync('New conversation');
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDeleteConversation = async (id: number) => {
    try {
      await deleteConversation.mutateAsync(id);
      if (activeId === id) {
        navigate('/chat');
      }
      toast({
        title: 'Conversation deleted',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeId) {
      // Create new conversation first
      try {
        const conversation = await createConversation.mutateAsync(content.slice(0, 50));
        await sendMessage.mutateAsync({
          conversationId: conversation.id,
          content,
        });
        navigate(`/chat/${conversation.id}`);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          status: 'error',
          duration: 3000,
        });
      }
    } else {
      try {
        await sendMessage.mutateAsync({
          conversationId: activeId,
          content,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleFeedback = async (messageId: number, feedback: 'helpful' | 'not_helpful' | null) => {
    if (!feedback) return;
    try {
      await updateFeedback.mutateAsync({ messageId, feedback });
    } catch (error) {
      // Silent fail for feedback
    }
  };

  return (
    <PageWrapper>
      <Flex h="calc(100vh - 140px)" gap={6}>
        {/* Sidebar */}
        <Box
          w="280px"
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
          p={4}
          display={{ base: 'none', lg: 'block' }}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="sm">Conversations</Heading>
            <GradientButton size="sm" onClick={handleNewConversation}>
              <FiPlus />
            </GradientButton>
          </Flex>
          <ConversationList
            conversations={conversations || []}
            isLoading={conversationsLoading}
            onDelete={handleDeleteConversation}
          />
        </Box>

        {/* Chat Area */}
        <Box
          flex={1}
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
        >
          <ChatWindow
            messages={activeConversation?.messages || []}
            onSendMessage={handleSendMessage}
            onFeedback={handleFeedback}
            isLoading={conversationLoading && !!activeId}
            isSending={sendMessage.isPending}
          />
        </Box>
      </Flex>
    </PageWrapper>
  );
}
