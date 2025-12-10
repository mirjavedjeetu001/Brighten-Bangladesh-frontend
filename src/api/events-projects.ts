import { apiClient } from './client';

// ============================================
// EVENTS
// ============================================

export interface Event {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  image_url?: string;
  event_date: string;
  location?: string;
  organizer?: string;
  max_participants?: number;
  registration_link?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventDto {
  title: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  image_url?: string;
  event_date: string;
  location?: string;
  organizer?: string;
  max_participants?: number;
  registration_link?: string;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export const eventsApi = {
  getAll: () => apiClient.get<Event[]>('/cms/events').then(res => res.data),
  getAllActive: () => apiClient.get<Event[]>('/cms/events/active').then(res => res.data),
  getFeatured: () => apiClient.get<Event[]>('/cms/events/featured').then(res => res.data),
  getUpcoming: () => apiClient.get<Event[]>('/cms/events/upcoming').then(res => res.data),
  getById: (id: number) => apiClient.get<Event>(`/cms/events/${id}`).then(res => res.data),
  getBySlug: (slug: string) => apiClient.get<Event>(`/cms/events/slug/${slug}`).then(res => res.data),
  create: (data: CreateEventDto) => apiClient.post<Event>('/cms/events', data).then(res => res.data),
  update: (id: number, data: UpdateEventDto) => apiClient.put<Event>(`/cms/events/${id}`, data).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/cms/events/${id}`).then(res => res.data),
};

// ============================================
// PROJECTS
// ============================================

export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  image_url?: string;
  category?: string;
  status: 'planning' | 'ongoing' | 'completed';
  start_date?: string;
  end_date?: string;
  location?: string;
  budget?: number;
  beneficiaries?: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectDto {
  title: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  image_url?: string;
  category?: string;
  status?: 'planning' | 'ongoing' | 'completed';
  start_date?: string;
  end_date?: string;
  location?: string;
  budget?: number;
  beneficiaries?: number;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export const projectsApi = {
  getAll: () => apiClient.get<Project[]>('/cms/projects').then(res => res.data),
  getAllActive: () => apiClient.get<Project[]>('/cms/projects/active').then(res => res.data),
  getFeatured: () => apiClient.get<Project[]>('/cms/projects/featured').then(res => res.data),
  getByStatus: (status: string) => apiClient.get<Project[]>(`/cms/projects/status/${status}`).then(res => res.data),
  getById: (id: number) => apiClient.get<Project>(`/cms/projects/${id}`).then(res => res.data),
  getBySlug: (slug: string) => apiClient.get<Project>(`/cms/projects/slug/${slug}`).then(res => res.data),
  create: (data: CreateProjectDto) => apiClient.post<Project>('/cms/projects', data).then(res => res.data),
  update: (id: number, data: UpdateProjectDto) => apiClient.put<Project>(`/cms/projects/${id}`, data).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/cms/projects/${id}`).then(res => res.data),
};

// ============================================
// EVENT REGISTRATIONS
// ============================================

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  registered_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    organization?: string;
  };
}

export const eventRegistrationsApi = {
  register: (eventId: number) => apiClient.post(`/cms/events/${eventId}/register`).then(res => res.data),
  cancel: (eventId: number) => apiClient.delete(`/cms/events/${eventId}/register`).then(res => res.data),
  getByEvent: (eventId: number) => apiClient.get<EventRegistration[]>(`/cms/events/${eventId}/registrations`).then(res => res.data),
  getMyRegistration: (eventId: number) => apiClient.get<EventRegistration>(`/cms/events/${eventId}/my-registration`).then(res => res.data),
  updateStatus: (eventId: number, userId: number, status: 'approved' | 'rejected') => 
    apiClient.put(`/cms/events/${eventId}/registrations/${userId}/status`, { status }).then(res => res.data),
};
