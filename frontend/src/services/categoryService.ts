import api from './api';
import { Category, CategoryCreate, CategoryUpdate, PaginatedResponse, Document } from '../types';

export const categoryService = {
  /**
   * Get all categories in tree structure
   */
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  /**
   * Get all categories as flat list
   */
  async getCategoriesFlat(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories/flat');
    return data;
  },

  /**
   * Get a single category by ID
   */
  async getCategory(id: number): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  /**
   * Get documents for a category
   */
  async getCategoryDocuments(
    categoryId: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedResponse<Document>> {
    const { data } = await api.get<PaginatedResponse<Document>>(
      `/categories/${categoryId}/documents`,
      {
        params: { page, per_page: perPage },
      }
    );
    return data;
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData: CategoryCreate): Promise<Category> {
    const { data } = await api.post<Category>('/categories', categoryData);
    return data;
  },

  /**
   * Update a category
   */
  async updateCategory(id: number, categoryData: CategoryUpdate): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, categoryData);
    return data;
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryService;
