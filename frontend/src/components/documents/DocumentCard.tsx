import { Box, Text, Flex, Badge, IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2, FiDownload, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Document } from '../../types';

interface DocumentCardProps {
  document: Document;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

const statusColors: Record<string, string> = {
  processing: 'yellow',
  active: 'green',
  archived: 'gray',
};

const fileTypeIcons: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  txt: '📃',
};

export function DocumentCard({ document, onEdit, onDelete, onDownload }: DocumentCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      bg="white"
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', borderColor: 'purple.200' }}
    >
      <Link to={`/documents/${document.id}`}>
        <Box p={4}>
          <Flex justify="space-between" align="start" mb={3}>
            <Flex align="center" gap={2}>
              <Text fontSize="2xl">{fileTypeIcons[document.file_type] || '📄'}</Text>
              <Box>
                <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                  {document.title}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatFileSize(document.file_size)}
                </Text>
              </Box>
            </Flex>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                onClick={(e) => e.preventDefault()}
              />
              <MenuList onClick={(e) => e.preventDefault()}>
                <Link to={`/documents/${document.id}`}>
                  <MenuItem icon={<FiEye />}>View</MenuItem>
                </Link>
                {onEdit && <MenuItem icon={<FiEdit2 />} onClick={onEdit}>Edit</MenuItem>}
                {onDownload && <MenuItem icon={<FiDownload />} onClick={onDownload}>Download</MenuItem>}
                {onDelete && (
                  <MenuItem icon={<FiTrash2 />} color="red.500" onClick={onDelete}>
                    Delete
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </Flex>

          {document.description && (
            <Text fontSize="xs" color="gray.600" noOfLines={2} mb={3}>
              {document.description}
            </Text>
          )}

          <Flex justify="space-between" align="center">
            <Badge colorScheme={statusColors[document.status]} size="sm">
              {document.status}
            </Badge>
            <Text fontSize="xs" color="gray.400">
              {new Date(document.created_at).toLocaleDateString()}
            </Text>
          </Flex>
        </Box>
      </Link>
    </Box>
  );
}
