import { useState } from 'react';
import { Box, Heading, Flex, SimpleGrid, useDisclosure, useToast, Spinner, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GradientButton } from '../components/ui/GradientButton';
import { CategoryCard } from '../components/categories/CategoryCard';
import { CategoryModal } from '../components/categories/CategoryModal';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { useAuth } from '../context/AuthContext';
import { Category, CategoryCreate } from '../types';

export function CategoriesPage() {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const toast = useToast();

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleOpenCreate = () => {
    setEditingCategory(null);
    onOpen();
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    onOpen();
  };

  const handleSubmit = async (data: CategoryCreate) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data });
        toast({
          title: 'Category updated',
          status: 'success',
          duration: 2000,
        });
      } else {
        await createCategory.mutateAsync(data);
        toast({
          title: 'Category created',
          status: 'success',
          duration: 2000,
        });
      }
      onClose();
      setEditingCategory(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: editingCategory ? 'Failed to update category' : 'Failed to create category',
        status: 'error',
        duration: 3000,
      });
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? Documents will be moved to "Uncategorized".')) {
      try {
        await deleteCategory.mutateAsync(id);
        toast({
          title: 'Category deleted',
          status: 'success',
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: 'Delete failed',
          description: 'Failed to delete category.',
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
          <Heading size="lg">Categories</Heading>
          <Text color="gray.500" mt={1}>
            Organize documents by topic
          </Text>
        </Box>
        {canManage && (
          <GradientButton leftIcon={<FiPlus />} onClick={handleOpenCreate}>
            Add Category
          </GradientButton>
        )}
      </Flex>

      {isLoading ? (
        <Flex justify="center" py={12}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
        </Flex>
      ) : categories?.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={12}
          color="gray.400"
        >
          <Text fontSize="5xl" mb={4}>📁</Text>
          <Text fontSize="lg" fontWeight="medium">No categories yet</Text>
          {canManage && (
            <Text fontSize="sm">Create your first category to organize documents</Text>
          )}
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {categories?.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={canManage ? () => handleOpenEdit(category) : undefined}
              onDelete={canManage ? () => handleDelete(category.id) : undefined}
            />
          ))}
        </SimpleGrid>
      )}

      <CategoryModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingCategory(null);
        }}
        onSubmit={handleSubmit}
        category={editingCategory}
        categories={categories || []}
        isLoading={createCategory.isPending || updateCategory.isPending}
      />
    </PageWrapper>
  );
}
