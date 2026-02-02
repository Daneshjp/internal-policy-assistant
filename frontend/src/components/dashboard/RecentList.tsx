import { Box, Text, Flex, VStack, Icon, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMessageSquare, FiFileText } from 'react-icons/fi';
import { RecentConversation, RecentDocument } from '../../types';
import { GlassCard } from '../ui/GlassCard';

interface RecentListProps {
  title: string;
  items: (RecentConversation | RecentDocument)[];
  type: 'conversations' | 'documents';
  viewAllLink: string;
  isLoading?: boolean;
}

export function RecentList({ title, items, type, viewAllLink, isLoading }: RecentListProps) {
  const icon = type === 'conversations' ? FiMessageSquare : FiFileText;

  return (
    <GlassCard>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontWeight="bold" fontSize="lg">{title}</Text>
        <Link to={viewAllLink}>
          <Flex
            as={motion.div}
            whileHover={{ x: 4 }}
            align="center"
            color="purple.500"
            fontSize="sm"
            fontWeight="medium"
          >
            View all <Icon as={FiArrowRight} ml={1} />
          </Flex>
        </Link>
      </Flex>

      {isLoading ? (
        <Flex justify="center" py={8}>
          <Spinner color="purple.500" />
        </Flex>
      ) : items.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={8}
          color="gray.400"
        >
          <Icon as={icon} boxSize={8} mb={2} />
          <Text fontSize="sm">No {type} yet</Text>
        </Flex>
      ) : (
        <VStack spacing={2} align="stretch">
          {items.map((item, index) => (
            <Link
              key={item.id}
              to={type === 'conversations' ? `/chat/${item.id}` : `/documents/${item.id}`}
            >
              <Flex
                as={motion.div}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4 }}
                align="center"
                p={3}
                borderRadius="lg"
                cursor="pointer"
              >
                <Flex
                  w={8}
                  h={8}
                  borderRadius="lg"
                  bg="purple.100"
                  align="center"
                  justify="center"
                  mr={3}
                >
                  <Icon as={icon} color="purple.500" />
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {item.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(item.created_at).toLocaleDateString()}
                    {'category_name' in item && item.category_name && ` • ${item.category_name}`}
                  </Text>
                </Box>
              </Flex>
            </Link>
          ))}
        </VStack>
      )}
    </GlassCard>
  );
}
