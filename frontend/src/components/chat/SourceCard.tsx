import { Box, Text, Flex, Icon } from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { SourceDocument } from '../../types';

interface SourceCardProps {
  source: SourceDocument;
  isLight?: boolean;
}

export function SourceCard({ source, isLight = false }: SourceCardProps) {
  return (
    <Link to={`/documents/${source.document_id}`}>
      <Box
        p={2}
        borderRadius="lg"
        bg={isLight ? 'whiteAlpha.200' : 'gray.50'}
        _hover={{
          bg: isLight ? 'whiteAlpha.300' : 'gray.100',
        }}
        transition="background 0.2s"
      >
        <Flex align="center" mb={1}>
          <Icon as={FiFileText} boxSize={3} mr={1} />
          <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>
            {source.title}
          </Text>
        </Flex>
        <Text
          fontSize="xs"
          opacity={0.8}
          noOfLines={2}
        >
          {source.chunk_content}
        </Text>
      </Box>
    </Link>
  );
}
