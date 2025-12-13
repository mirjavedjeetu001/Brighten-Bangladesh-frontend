import { apiClient } from './client';

// Helper function to ensure array responses
const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
  console.warn('API returned non-array data:', data);
  return [];
};

// ============================================
// HERO SLIDERS
// ============================================

export interface HeroSlider {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHeroSliderDto {
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateHeroSliderDto extends Partial<CreateHeroSliderDto> {}

export interface ReorderHeroSlidersDto {
  order: number[];
}

export const heroSliderApi = {
  getAll: async (): Promise<HeroSlider[]> => {
    try {
      const res = await apiClient.get<HeroSlider[]>('/cms/hero-sliders');
      return ensureArray<HeroSlider>(res.data);
    } catch (error) {
      console.error('Error fetching hero sliders:', error);
      return [];
    }
  },
  getAllActive: async (): Promise<HeroSlider[]> => {
    try {
      const res = await apiClient.get<HeroSlider[]>('/cms/hero-sliders/active');
      return ensureArray<HeroSlider>(res.data);
    } catch (error) {
      console.error('Error fetching active hero sliders:', error);
      return [];
    }
  },
  getById: (id: number) => apiClient.get<HeroSlider>(`/cms/hero-sliders/${id}`).then(res => res.data),
  create: (data: CreateHeroSliderDto) => apiClient.post<HeroSlider>('/cms/hero-sliders', data).then(res => res.data),
  update: (id: number, data: UpdateHeroSliderDto) => apiClient.put<HeroSlider>(`/cms/hero-sliders/${id}`, data).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/cms/hero-sliders/${id}`).then(res => res.data),
  reorder: (data: ReorderHeroSlidersDto) => apiClient.patch('/cms/hero-sliders/reorder', data).then(res => res.data),
};

// ============================================
// PAGES
// ============================================

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published: boolean;
  published_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreatePageDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published?: boolean;
}

export interface UpdatePageDto extends Partial<CreatePageDto> {}

export const pageApi = {
  getAll: () => apiClient.get<Page[]>('/cms/pages').then(res => res.data),
  getPublished: () => apiClient.get<Page[]>('/cms/pages/published').then(res => res.data),
  getBySlug: (slug: string) => apiClient.get<Page>(`/cms/pages/slug/${slug}`).then(res => res.data),
  getById: (id: number) => apiClient.get<Page>(`/cms/pages/${id}`).then(res => res.data),
  create: (data: CreatePageDto) => apiClient.post<Page>('/cms/pages', data).then(res => res.data),
  update: (id: number, data: UpdatePageDto) => apiClient.put<Page>(`/cms/pages/${id}`, data).then(res => res.data),
  publish: (id: number) => apiClient.patch<Page>(`/cms/pages/${id}/publish`).then(res => res.data),
  unpublish: (id: number) => apiClient.patch<Page>(`/cms/pages/${id}/unpublish`).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/cms/pages/${id}`).then(res => res.data),
};

// ============================================
// FOCUS AREAS
// ============================================

export interface FocusArea {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  icon?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFocusAreaDto {
  title: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  icon?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateFocusAreaDto extends Partial<CreateFocusAreaDto> {}

export const focusAreaApi = {
  getAll: async (): Promise<FocusArea[]> => {
    try {
      const res = await apiClient.get<FocusArea[]>('/cms/focus-areas');
      return ensureArray<FocusArea>(res.data);
    } catch (error) {
      console.error('Error fetching focus areas:', error);
      return [];
    }
  },
  getAllActive: async (): Promise<FocusArea[]> => {
    try {
      const res = await apiClient.get<FocusArea[]>('/cms/focus-areas/active');
      return ensureArray<FocusArea>(res.data);
    } catch (error) {
      console.error('Error fetching active focus areas:', error);
      return [];
    }
  },
  getBySlug: (slug: string) => apiClient.get<FocusArea>(`/cms/focus-areas/slug/${slug}`).then(res => res.data),
  getById: (id: number) => apiClient.get<FocusArea>(`/cms/focus-areas/${id}`).then(res => res.data),
  create: (data: CreateFocusAreaDto) => apiClient.post<FocusArea>('/cms/focus-areas', data).then(res => res.data),
  update: (id: number, data: UpdateFocusAreaDto) => apiClient.put<FocusArea>(`/cms/focus-areas/${id}`, data).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/cms/focus-areas/${id}`).then(res => res.data),
};

// ============================================
// STATISTICS
// ============================================

export interface Statistic {
  id: number;
  label: string;
  value: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BulkUpdateStatisticsDto {
  statistics: {
    id: number;
    label?: string;
    value?: string;
    icon?: string;
    display_order?: number;
    is_active?: boolean;
  }[];
}

export const statisticApi = {
  getAll: async (): Promise<Statistic[]> => {
    try {
      const res = await apiClient.get<Statistic[]>('/cms/statistics');
      return ensureArray<Statistic>(res.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return [];
    }
  },
  getAllActive: async (): Promise<Statistic[]> => {
    try {
      const res = await apiClient.get<Statistic[]>('/cms/statistics/active');
      return ensureArray<Statistic>(res.data);
    } catch (error) {
      console.error('Error fetching active statistics:', error);
      return [];
    }
  },
  bulkUpdate: (data: BulkUpdateStatisticsDto) => apiClient.put<Statistic[]>('/cms/statistics', data).then(res => res.data),
};

// ============================================
// SETTINGS
// ============================================

export interface Setting {
  id: number;
  key: string;
  value: string;
  category?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingDto {
  value: string;
}

export interface BulkUpdateSettingsDto {
  settings: {
    key: string;
    value: string;
  }[];
}

export const settingApi = {
  getAll: () => apiClient.get<Setting[]>('/cms/settings').then(res => res.data),
  getAllAsObject: () => apiClient.get<Record<string, string>>('/cms/settings/object').then(res => res.data),
  getByCategory: (category: string) => apiClient.get<Setting[]>(`/cms/settings/category/${category}`).then(res => res.data),
  getByKey: (key: string) => apiClient.get<Setting>(`/cms/settings/${key}`).then(res => res.data),
  update: (key: string, data: UpdateSettingDto) => apiClient.put<Setting>(`/cms/settings/${key}`, data).then(res => res.data),
  bulkUpdate: (data: BulkUpdateSettingsDto) => apiClient.put<Setting[]>('/cms/settings', data).then(res => res.data),
};

// ============================================
// CONTACT SUBMISSIONS
// ============================================

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactFormDto {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface UpdateContactStatusDto {
  status: 'unread' | 'read' | 'replied' | 'archived';
}

export const contactApi = {
  submit: (data: ContactFormDto) => apiClient.post<ContactSubmission>('/cms/contact', data).then(res => res.data),
  getSubmissions: () => apiClient.get<ContactSubmission[]>('/cms/contact/submissions').then(res => res.data),
  getUnreadCount: () => apiClient.get<{ count: number }>('/cms/contact/submissions/unread-count').then(res => res.data),
  getById: (id: number) => apiClient.get<ContactSubmission>(`/cms/contact/submissions/${id}`).then(res => res.data),
  updateStatus: (id: number, data: UpdateContactStatusDto) => apiClient.put<ContactSubmission>(`/cms/contact/submissions/${id}/status`, data).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/cms/contact/submissions/${id}`).then(res => res.data),
};
