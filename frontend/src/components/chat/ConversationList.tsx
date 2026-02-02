import { Box, VStack, Text, Flex, IconButton, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
}

export function ConversationList({ conversations, isLoading, onDelete }: ConversationListProps) {
  const { conversationId } = useParams();
  const activeId = conversationId ? parseInt(conversationId) : undefined;

  if (isLoading) {
    return (
      <Flex justify="center" py={8}>
        <Spinner color="purple.500" />
      </Flex>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box textAlign="center" py={8} color="gray.500">
        <FiMessageSquare size={32} style={{ margin: '0 auto 8px' }} />
        <Text fontSize="sm">No conversations yet</Text>
        <Text fontSize="xs">Start by asking a question</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={1} align="stretch">
      {conversations.map((conversation) => (
        <Link key={conversation.id} to={`/chat/${conversation.id}`}>
          <Flex
            as={motion.div}
            whileHover={{ x: 4 }}
            align="center"
            justify="space-between"
            p={3}
            borderRadius="lg"
            bg={activeId === conversation.id ? 'purple.50' : 'transparent'}
            color={activeId === conversation.id ? 'purple.700' : 'gray.700'}
            _hover={{
              bg: activeId === conversation.id ? 'purple.50' : 'gray.50',
            }}
            transition="all 0.2s"
          >
            <Box flex={1} minW={0}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {conversation.title || 'New conversation'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(conversation.updated_at).toLocaleDateString()}
              </Text>
            </Box>
            {onDelete && (
              <IconButton
                aria-label="Delete conversation"
                icon={<FiTrash2 />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                opacity={0}
                _groupHover={{ opacity: 1 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(conversation.id);
                }}
              />
            )}
          </Flex>
        </Link>
      ))}
    </VStack>
  );
}
