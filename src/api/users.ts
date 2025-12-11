import apiClient from './client';
import { User, PaginatedResult } from './types';

export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },

  getAll: async (page = 1, limit = 10): Promise<PaginatedResult<User>> => {
    const response = await apiClient.get('/users', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  updateRole: async (id: number, role: string): Promise<User> => {
    const response = await apiClient.put(`/users/${id}/role`, { role });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getApproved: async (page = 1, limit = 10): Promise<PaginatedResult<User>> => {
    const response = await apiClient.get('/users/approved/list', {
      params: { page, limit },
    });
    return response.data;
  },

  getApprovedUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users/approved/list', {
      params: { page: 1, limit: 1000 },
    });
    return response.data.data;
  },
};
