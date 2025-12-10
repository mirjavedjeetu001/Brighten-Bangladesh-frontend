import apiClient from './client';
import { Magazine, PaginatedResult } from './types';

export interface CreateMagazineRequest {
  title: string;
  issueNumber?: string;
  publishDate?: string;
  coverImage?: string;
  filePath?: string;
}

export const magazinesApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResult<Magazine>> => {
    const response = await apiClient.get('/magazines', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Magazine> => {
    const response = await apiClient.get(`/magazines/${id}`);
    return response.data;
  },

  create: async (data: CreateMagazineRequest): Promise<Magazine> => {
    const response = await apiClient.post('/magazines', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateMagazineRequest>): Promise<Magazine> => {
    const response = await apiClient.put(`/magazines/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/magazines/${id}`);
  },
};
