import { useRef, useEffect } from 'react';
import { Box, VStack, Flex, Text, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Message, MessageFeedback } from '../../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onFeedback?: (messageId: number, feedback: MessageFeedback) => void;
  isLoading?: boolean;
  isSending?: boolean;
}

export function ChatWindow({
  messages,
  onSendMessage,
  onFeedback,
  isLoading = false,
  isSending = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%">
      {/* Messages Area */}
      <Box
        flex={1}
        overflowY="auto"
        px={4}
        py={6}
        css={{
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '3px' },
        }}
      >
        {messages.length === 0 ? (
          <Flex
            direction="column"
            justify="center"
            align="center"
            h="100%"
            color="gray.500"
          >
            <Box
              as={motion.div}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              textAlign="center"
            >
              <Text fontSize="4xl" mb={2}>💬</Text>
              <Text fontSize="lg" fontWeight="medium">Start a conversation</Text>
              <Text fontSize="sm" color="gray.400" maxW="sm" mt={2}>
                Ask any question about company policies, HR guidelines, or compliance procedures.
              </Text>
            </Box>
          </Flex>
        ) : (
          <VStack spacing={0} align="stretch">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onFeedback={
                  message.role === 'assistant' && onFeedback
                    ? (feedback) => onFeedback(message.id, feedback)
                    : undefined
                }
              />
            ))}
            {isSending && (
              <Flex justify="flex-start" mb={4}>
                <Box
                  bg="white"
                  px={4}
                  py={3}
                  borderRadius="2xl"
                  borderBottomLeftRadius="sm"
                  boxShadow="md"
                >
                  <Flex align="center" gap={2}>
                    <Spinner size="sm" color="purple.500" />
                    <Text fontSize="sm" color="gray.500">Thinking...</Text>
                  </Flex>
                </Box>
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Input Area */}
      <Box p={4} borderTop="1px solid" borderColor="gray.100">
        <MessageInput onSend={onSendMessage} isLoading={isSending} />
      </Box>
    </Flex>
  );
}
