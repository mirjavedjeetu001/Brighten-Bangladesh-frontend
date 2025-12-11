import apiClient from './client';
import { User } from './types';

export interface TeamMember {
  id: number;
  user_id: number;
  user: User;
  role: string;
  category?: string;
  contributions?: string;
  social_links?: Record<string, string>;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamMemberDto {
  user_id: number;
  role: string;
  category?: string;
  contributions?: string;
  social_links?: Record<string, string>;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateTeamMemberDto {
  role?: string;
  category?: string;
  contributions?: string;
  social_links?: Record<string, string>;
  display_order?: number;
  is_active?: boolean;
}

export const teamMemberAPI = {
  getAll: async (): Promise<TeamMember[]> => {
    const { data } = await apiClient.get('/cms/team-members');
    return data;
  },

  getActive: async (): Promise<TeamMember[]> => {
    const { data } = await apiClient.get('/cms/team-members/active');
    return data;
  },

  getOne: async (id: number): Promise<TeamMember> => {
    const { data } = await apiClient.get(`/cms/team-members/${id}`);
    return data;
  },

  create: async (dto: CreateTeamMemberDto): Promise<TeamMember> => {
    const { data } = await apiClient.post('/cms/team-members', dto);
    return data;
  },

  update: async (id: number, dto: UpdateTeamMemberDto): Promise<TeamMember> => {
    const { data } = await apiClient.put(`/cms/team-members/${id}`, dto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/cms/team-members/${id}`);
  },

  toggleActive: async (id: number): Promise<TeamMember> => {
    const { data } = await apiClient.patch(`/cms/team-members/${id}/toggle-active`);
    return data;
  },

  reorder: async (order: number[]): Promise<void> => {
    await apiClient.patch('/cms/team-members/reorder', { order });
  },
};
