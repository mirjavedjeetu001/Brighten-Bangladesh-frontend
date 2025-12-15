import apiClient from './client';
import { Job, JobCategory, PaginatedResult } from './types';

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  jobType?: string;
  categoryId?: number;
  activeOnly?: boolean;
}

export interface CreateJobRequest {
  title: string;
  description?: string;
  company?: string;
  location?: string;
  jobType?: string;
  categoryId?: number;
  applyLink: string;
  deadline?: string;
  isActive?: boolean;
}

export interface CreateJobCategoryRequest {
  name: string;
  isActive?: boolean;
  displayOrder?: number;
}

export const jobCategoriesApi = {
  getAll: async (): Promise<JobCategory[]> => {
    const response = await apiClient.get('/job-categories');
    return response.data;
  },

  getAllAdmin: async (): Promise<JobCategory[]> => {
    const response = await apiClient.get('/job-categories/all');
    return response.data;
  },

  getById: async (id: number): Promise<JobCategory> => {
    const response = await apiClient.get(`/job-categories/${id}`);
    return response.data;
  },

  create: async (data: CreateJobCategoryRequest): Promise<JobCategory> => {
    const response = await apiClient.post('/job-categories', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateJobCategoryRequest>): Promise<JobCategory> => {
    const response = await apiClient.put(`/job-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/job-categories/${id}`);
  },
};

export const jobsApi = {
  getAll: async (filters: JobFilters = {}): Promise<PaginatedResult<Job>> => {
    const response = await apiClient.get('/jobs', { params: filters });
    return response.data;
  },

  getActive: async (): Promise<Job[]> => {
    const response = await apiClient.get('/jobs/active');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Job> => {
    const response = await apiClient.get(`/jobs/${slug}`);
    return response.data;
  },

  create: async (data: CreateJobRequest): Promise<Job> => {
    const response = await apiClient.post('/jobs', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateJobRequest>): Promise<Job> => {
    const response = await apiClient.put(`/jobs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },
};
