import { useState } from 'react';
import { Box, Heading, Flex, SimpleGrid, useDisclosure, useToast, Spinner, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GradientButton } from '../components/ui/GradientButton';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentFilters } from '../components/documents/DocumentFilters';
import { UploadModal } from '../components/documents/UploadModal';
import { useDocuments, useUploadDocument, useDeleteDocument } from '../hooks/useDocuments';
import { useCategories } from '../hooks/useCategories';
import { DocumentStatus } from '../types';

export function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const { data: documents, isLoading } = useDocuments({
    search,
    status: status || undefined,
    category_id: categoryId || undefined,
  });
  const { data: categories } = useCategories();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  const handleUpload = async (data: { title: string; description: string; category_id?: number; file: File }) => {
    try {
      await uploadDocument.mutateAsync(data);
      toast({
        title: 'Document uploaded',
        description: 'Your document is being processed.',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document. Please try again.',
        status: 'error',
        duration: 3000,
      });
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument.mutateAsync(id);
        toast({
          title: 'Document deleted',
          status: 'success',
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: 'Delete failed',
          description: 'Failed to delete document.',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  return (
    <PageWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">Documents</Heading>
          <Text color="gray.500" mt={1}>
            Upload and manage your policy documents
          </Text>
        </Box>
        <GradientButton leftIcon={<FiPlus />} onClick={onOpen}>
          Upload Document
        </GradientButton>
      </Flex>

      <Box mb={6}>
        <DocumentFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories || []}
        />
      </Box>

      {isLoading ? (
        <Flex justify="center" py={12}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
        </Flex>
      ) : !documents?.items?.length ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={12}
          color="gray.400"
        >
          <Text fontSize="5xl" mb={4}>📄</Text>
          <Text fontSize="lg" fontWeight="medium">No documents found</Text>
          <Text fontSize="sm">Upload your first document to get started</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {documents.items.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={() => handleDelete(doc.id)}
            />
          ))}
        </SimpleGrid>
      )}

      <UploadModal
        isOpen={isOpen}
        onClose={onClose}
        onUpload={handleUpload}
        categories={categories || []}
        isUploading={uploadDocument.isPending}
      />
    </PageWrapper>
  );
}
