import { useEffect } from 'react';
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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, CategoryCreate } from '../../types';
import { GradientButton } from '../ui/GradientButton';
import { AnimatedInput } from '../ui/AnimatedInput';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  icon: z.string().optional(),
  parent_id: z.number().nullable().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryCreate) => Promise<void>;
  category?: Category | null;
  categories: Category[];
  isLoading?: boolean;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  categories,
  isLoading = false,
}: CategoryModalProps) {
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      parent_id: null,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        parent_id: category.parent_id,
      });
    } else {
      reset({
        name: '',
        description: '',
        icon: '',
        parent_id: null,
      });
    }
  }, [category, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit({
      name: data.name,
      description: data.description,
      icon: data.icon,
      parent_id: data.parent_id,
    });
    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Filter out the current category from parent options (can't be parent of itself)
  const parentOptions = categories.filter((c) => c.id !== category?.id);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="2xl">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>{isEditing ? 'Edit Category' : 'Create Category'}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontSize="sm">Name</FormLabel>
                <AnimatedInput
                  {...register('name')}
                  placeholder="Category name"
                  error={errors.name?.message}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Brief description..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Icon</FormLabel>
                <Select {...register('icon')} placeholder="Select icon">
                  <option value="folder">📁 Folder</option>
                  <option value="policy">📋 Policy</option>
                  <option value="hr">👥 HR</option>
                  <option value="compliance">⚖️ Compliance</option>
                  <option value="it">💻 IT</option>
                  <option value="finance">💰 Finance</option>
                  <option value="security">🔒 Security</option>
                  <option value="general">📄 General</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Parent Category</FormLabel>
                <Select
                  {...register('parent_id', {
                    setValueAs: (v) => (v === '' ? null : parseInt(v)),
                  })}
                  placeholder="None (top-level)"
                >
                  {parentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <GradientButton type="submit" isLoading={isLoading}>
              {isEditing ? 'Save Changes' : 'Create Category'}
            </GradientButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
