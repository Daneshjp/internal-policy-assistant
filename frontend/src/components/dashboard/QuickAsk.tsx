import { useState } from 'react';
import { Box, Text, Flex, Textarea, IconButton, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCreateConversation, useSendMessage } from '../../hooks/useChat';
import { GlassCard } from '../ui/GlassCard';

export function QuickAsk() {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  const handleSubmit = async () => {
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Create new conversation
      const conversation = await createConversation.mutateAsync(question.slice(0, 50));

      // Send the message
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: question.trim(),
      });

      // Navigate to the chat
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start conversation. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <GlassCard>
      <Flex align="center" gap={3} mb={4}>
        <Flex
          w={10}
          h={10}
          borderRadius="lg"
          bgGradient="linear(to-br, purple.400, pink.400)"
          align="center"
          justify="center"
        >
          <FiMessageSquare color="white" size={20} />
        </Flex>
        <Box>
          <Text fontWeight="bold" fontSize="lg">Quick Ask</Text>
          <Text fontSize="sm" color="gray.500">Get instant answers from policies</Text>
        </Box>
      </Flex>

      <Flex gap={2}>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about company policies..."
          rows={2}
          resize="none"
          borderRadius="xl"
          disabled={isSubmitting}
        />
        <IconButton
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Ask question"
          icon={<FiSend />}
          colorScheme="purple"
          borderRadius="xl"
          h="auto"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!question.trim()}
        />
      </Flex>
    </GlassCard>
  );
}
