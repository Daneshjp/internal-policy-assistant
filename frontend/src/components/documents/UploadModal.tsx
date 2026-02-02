import { useState, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Box,
  Text,
  Flex,
  Icon,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Category } from '../../types';
import { GradientButton } from '../ui/GradientButton';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; description: string; category_id?: number; file: File }) => Promise<void>;
  categories: Category[];
  isUploading?: boolean;
  uploadProgress?: number;
}

export function UploadModal({
  isOpen,
  onClose,
  onUpload,
  categories,
  isUploading = false,
  uploadProgress = 0,
}: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF, DOCX, or TXT file.',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB.',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [title, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSubmit = async () => {
    if (!file || !title.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide a title and select a file.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      await onUpload({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId || undefined,
        file,
      });
      handleClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setTitle('');
      setDescription('');
      setCategoryId('');
      setFile(null);
      onClose();
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>Upload Document</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            {/* Dropzone */}
            {!file ? (
              <Box
                {...getRootProps()}
                as={motion.div}
                whileHover={{ scale: 1.01 }}
                w="100%"
                p={8}
                border="2px dashed"
                borderColor={isDragActive ? 'purple.400' : 'gray.200'}
                borderRadius="xl"
                bg={isDragActive ? 'purple.50' : 'gray.50'}
                cursor="pointer"
                textAlign="center"
                transition="all 0.2s"
              >
                <input {...getInputProps()} />
                <Icon as={FiUploadCloud} boxSize={10} color="purple.400" mb={2} />
                <Text fontWeight="medium" color="gray.700">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  or click to select a file
                </Text>
                <Text fontSize="xs" color="gray.400" mt={2}>
                  Supported: PDF, DOCX, TXT (max 10MB)
                </Text>
              </Box>
            ) : (
              <Flex
                w="100%"
                p={4}
                bg="purple.50"
                borderRadius="xl"
                align="center"
                justify="space-between"
              >
                <Flex align="center" gap={3}>
                  <Icon as={FiFile} boxSize={6} color="purple.500" />
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                      {file.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {(file.size / 1024).toFixed(1)} KB
                    </Text>
                  </Box>
                </Flex>
                {!isUploading && (
                  <Button size="sm" variant="ghost" onClick={removeFile}>
                    <FiX />
                  </Button>
                )}
              </Flex>
            )}

            {isUploading && (
              <Box w="100%">
                <Progress
                  value={uploadProgress}
                  size="sm"
                  colorScheme="purple"
                  borderRadius="full"
                />
                <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
                  Uploading... {uploadProgress}%
                </Text>
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel fontSize="sm">Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                disabled={isUploading}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document..."
                rows={3}
                disabled={isUploading}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Category</FormLabel>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Select category"
                disabled={isUploading}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={handleClose} isDisabled={isUploading}>
            Cancel
          </Button>
          <GradientButton
            onClick={handleSubmit}
            isLoading={isUploading}
            isDisabled={!file || !title.trim()}
          >
            Upload
          </GradientButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
