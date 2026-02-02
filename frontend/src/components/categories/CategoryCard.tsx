import { Box, Text, Flex, Badge, IconButton, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiFolder, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CategoryCardProps {
  category: Category;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      bg="white"
      borderRadius="2xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: 'lg', borderColor: 'purple.200' }}
    >
      <Link to={`/categories/${category.id}`}>
        <Box p={6}>
          <Flex justify="space-between" align="start" mb={4}>
            <Flex
              w={12}
              h={12}
              borderRadius="xl"
              bgGradient="linear(to-br, purple.400, pink.400)"
              align="center"
              justify="center"
            >
              <Icon as={FiFolder} boxSize={6} color="white" />
            </Flex>
            {canManage && (
              <Flex gap={1} onClick={(e) => e.preventDefault()}>
                {onEdit && (
                  <IconButton
                    aria-label="Edit category"
                    icon={<FiEdit2 />}
                    size="sm"
                    variant="ghost"
                    onClick={onEdit}
                  />
                )}
                {onDelete && (
                  <IconButton
                    aria-label="Delete category"
                    icon={<FiTrash2 />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={onDelete}
                  />
                )}
              </Flex>
            )}
          </Flex>

          <Text fontWeight="bold" fontSize="lg" mb={1} noOfLines={1}>
            {category.name}
          </Text>

          {category.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2} mb={4}>
              {category.description}
            </Text>
          )}

          <Flex align="center" gap={2}>
            <Badge
              colorScheme="purple"
              borderRadius="full"
              px={2}
              py={1}
              display="flex"
              alignItems="center"
              gap={1}
            >
              <FiFileText size={12} />
              {category.document_count || 0} documents
            </Badge>
          </Flex>
        </Box>
      </Link>
    </Box>
  );
}
