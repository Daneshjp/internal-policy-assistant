import { Box, Text, Flex, IconButton, Collapse, useDisclosure, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiThumbsUp, FiThumbsDown, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Message, MessageFeedback } from '../../types';
import { SourceCard } from './SourceCard';

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (feedback: MessageFeedback) => void;
}

export function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { isOpen, onToggle } = useDisclosure();
  const hasSources = message.source_documents && message.source_documents.length > 0;

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      w="100%"
      display="flex"
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      mb={4}
    >
      <Box
        maxW="70%"
        bg={isUser ? 'purple.500' : 'white'}
        color={isUser ? 'white' : 'gray.800'}
        px={4}
        py={3}
        borderRadius="2xl"
        borderBottomRightRadius={isUser ? 'sm' : '2xl'}
        borderBottomLeftRadius={isUser ? '2xl' : 'sm'}
        boxShadow="md"
      >
        <Text whiteSpace="pre-wrap" fontSize="sm" lineHeight="tall">
          {message.content}
        </Text>

        {/* Source Documents Toggle */}
        {hasSources && (
          <Box mt={3}>
            <Flex
              as="button"
              onClick={onToggle}
              align="center"
              fontSize="xs"
              color={isUser ? 'purple.100' : 'purple.500'}
              _hover={{ color: isUser ? 'white' : 'purple.600' }}
            >
              {isOpen ? <FiChevronUp /> : <FiChevronDown />}
              <Text ml={1}>{message.source_documents!.length} sources</Text>
            </Flex>
            <Collapse in={isOpen}>
              <VStack mt={2} spacing={2} align="stretch">
                {message.source_documents!.map((source, idx) => (
                  <SourceCard key={idx} source={source} isLight={isUser} />
                ))}
              </VStack>
            </Collapse>
          </Box>
        )}

        {/* Feedback Buttons (only for assistant messages) */}
        {!isUser && onFeedback && (
          <Flex mt={3} gap={2}>
            <IconButton
              aria-label="Helpful"
              icon={<FiThumbsUp />}
              size="xs"
              variant={message.feedback === 'helpful' ? 'solid' : 'ghost'}
              colorScheme={message.feedback === 'helpful' ? 'green' : 'gray'}
              onClick={() => onFeedback('helpful')}
            />
            <IconButton
              aria-label="Not helpful"
              icon={<FiThumbsDown />}
              size="xs"
              variant={message.feedback === 'not_helpful' ? 'solid' : 'ghost'}
              colorScheme={message.feedback === 'not_helpful' ? 'red' : 'gray'}
              onClick={() => onFeedback('not_helpful')}
            />
          </Flex>
        )}
      </Box>
    </Box>
  );
}
