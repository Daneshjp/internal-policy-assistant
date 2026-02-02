import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { CategoryCreate, CategoryUpdate } from '../types';

/**
 * Hook to fetch categories tree
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
}

/**
 * Hook to fetch categories as flat list
 */
export function useCategoriesFlat() {
  return useQuery({
    queryKey: ['categories', 'flat'],
    queryFn: () => categoryService.getCategoriesFlat(),
  });
}

/**
 * Hook to fetch a single category
 */
export function useCategory(id: number | undefined) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryService.getCategory(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch category documents
 */
export function useCategoryDocuments(
  categoryId: number | undefined,
  page: number = 1,
  perPage: number = 20
) {
  return useQuery({
    queryKey: ['categories', categoryId, 'documents', page, perPage],
    queryFn: () => categoryService.getCategoryDocuments(categoryId!, page, perPage),
    enabled: !!categoryId,
  });
}

/**
 * Hook to create a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreate) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdate }) =>
      categoryService.updateCategory(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
