import apiClient from './client';
import { Blog, BlogCategory, PaginatedResult } from './types';

// Helper function to ensure array responses
const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
  console.warn('API returned non-array data:', data);
  return [];
};

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  authorId?: string;
  categoryId?: string;
}

export interface CreateBlogRequest {
  title: string;
  coverImage?: string;
  summary?: string;
  content: string;
  categoryId?: number | string;
}

export const blogsApi = {
  getAll: async (filters: BlogFilters = {}): Promise<PaginatedResult<Blog>> => {
    try {
      const response = await apiClient.get('/blogs', {
        params: filters,
      });
      const data = response.data;
      
      // Ensure proper structure
      return {
        data: ensureArray<Blog>(data?.data || data),
        total: data?.total || 0,
        page: data?.page || filters?.page || 1,
        limit: data?.limit || filters?.limit || 10,
        totalPages: data?.totalPages || 0,
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  },

  getBySlug: async (slug: string): Promise<Blog> => {
    const response = await apiClient.get(`/blogs/${slug}`);
    return response.data;
  },

  incrementView: async (id: number): Promise<{ views: number }> => {
    const response = await apiClient.post(`/blogs/${id}/view`);
    return response.data;
  },

  toggleLike: async (id: number): Promise<{ liked: boolean; likes: number }> => {
    const response = await apiClient.post(`/blogs/${id}/like`);
    return response.data;
  },

  create: async (data: CreateBlogRequest): Promise<Blog> => {
    const response = await apiClient.post('/blogs', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateBlogRequest>): Promise<Blog> => {
    const response = await apiClient.put(`/blogs/${id}`, data);
    return response.data;
  },

  submit: async (id: number): Promise<Blog> => {
    const response = await apiClient.post(`/blogs/${id}/submit`);
    return response.data;
  },

  approve: async (id: number): Promise<Blog> => {
    const response = await apiClient.post(`/blogs/${id}/approve`);
    return response.data;
  },

  publish: async (id: number): Promise<Blog> => {
    const response = await apiClient.post(`/blogs/${id}/publish`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/blogs/${id}`);
  },

  // Categories
  getCategories: async (): Promise<BlogCategory[]> => {
    const response = await apiClient.get('/blog-categories');
    return response.data;
  },

  getAllCategoriesAdmin: async (): Promise<BlogCategory[]> => {
    const response = await apiClient.get('/blog-categories/all');
    return response.data;
  },

  createCategory: async (name: string): Promise<BlogCategory> => {
    const response = await apiClient.post('/blog-categories', { name });
    return response.data;
  },

  updateCategory: async (id: number, payload: Partial<BlogCategory>): Promise<BlogCategory> => {
    const response = await apiClient.put(`/blog-categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/blog-categories/${id}`);
  },
};
