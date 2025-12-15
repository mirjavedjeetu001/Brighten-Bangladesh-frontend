import apiClient from './client';
import { NavigationMenu } from './types';

interface CreateMenuRequest {
  name: string;
  label: string;
  path: string;
  isActive?: boolean;
  displayOrder?: number;
  icon?: string;
}

interface UpdateMenuRequest {
  label?: string;
  path?: string;
  isActive?: boolean;
  displayOrder?: number;
  icon?: string;
}

export const navigationMenusApi = {
  // Public endpoint - get active menus only
  getAll: async (): Promise<NavigationMenu[]> => {
    const { data } = await apiClient.get<NavigationMenu[]>('/cms/navigation-menus');
    return data;
  },

  // Admin endpoint - get all menus
  getAllAdmin: async (): Promise<NavigationMenu[]> => {
    const { data } = await apiClient.get<NavigationMenu[]>('/cms/navigation-menus/all');
    return data;
  },

  // Get single menu by ID
  getById: async (id: number): Promise<NavigationMenu> => {
    const { data } = await apiClient.get<NavigationMenu>(`/cms/navigation-menus/${id}`);
    return data;
  },

  // Create new menu
  create: async (menu: CreateMenuRequest): Promise<NavigationMenu> => {
    const { data } = await apiClient.post<NavigationMenu>('/cms/navigation-menus', menu);
    return data;
  },

  // Update menu
  update: async (id: number, updates: UpdateMenuRequest): Promise<NavigationMenu> => {
    const { data } = await apiClient.put<NavigationMenu>(`/cms/navigation-menus/${id}`, updates);
    return data;
  },

  // Delete menu
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/cms/navigation-menus/${id}`);
  },

  // Reorder menus
  reorder: async (menuIds: number[]): Promise<void> => {
    await apiClient.patch('/cms/navigation-menus/reorder', { menuIds });
  },
};
