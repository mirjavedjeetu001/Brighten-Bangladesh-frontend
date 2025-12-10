import apiClient from './client';
import { Blog, PaginatedResult } from './types';

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  authorId?: string;
}

export interface CreateBlogRequest {
  title: string;
  coverImage?: string;
  summary?: string;
  content: string;
}

export const blogsApi = {
  getAll: async (filters: BlogFilters = {}): Promise<PaginatedResult<Blog>> => {
    const response = await apiClient.get('/blogs', {
      params: filters,
    });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Blog> => {
    const response = await apiClient.get(`/blogs/${slug}`);
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
};
