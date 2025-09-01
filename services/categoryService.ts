import api from '../lib/axios';
import { Category, CreateCategoryData, UpdateCategoryData } from '../types/category';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data.data?.categories || response.data.categories || response.data || [];
  },

  async getActiveCategories(): Promise<Category[]> {
    const response = await api.get('/categories/active');
    return response.data.data?.categories || response.data.categories || response.data || [];
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async updateCategory(id: number, data: UpdateCategoryData): Promise<Category> {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  async toggleCategoryStatus(id: number): Promise<Category> {
    const response = await api.patch(`/categories/${id}/toggle-status`);
    return response.data;
  },

  // Helper function to generate slug from name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
};