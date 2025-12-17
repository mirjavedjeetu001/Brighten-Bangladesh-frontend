import { apiClient } from './client';

export interface CvTemplate {
  id: number;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  htmlContent: string;
  cssContent?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  photo?: string;
  summary?: string;
}

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  graduationDate: string;
  location?: string;
  description?: string;
}

export interface UserCv {
  id: number;
  userId: number;
  templateId: number;
  title: string;
  personalInfo?: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  languages?: Array<{ language: string; proficiency: string }>;
  additionalSections?: any;
  htmlContent?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  template?: CvTemplate;
}

// CV Templates API
export const cvTemplatesApi = {
  getAll: () => apiClient.get<CvTemplate[]>('/cv-templates'),
  getOne: (id: number) => apiClient.get<CvTemplate>(`/cv-templates/${id}`),
};

// CMS CV Templates API (Admin)
export const cmsCvTemplatesApi = {
  getAll: () => apiClient.get<CvTemplate[]>('/cms/cv-templates'),
  getOne: (id: number) => apiClient.get<CvTemplate>(`/cms/cv-templates/${id}`),
  create: (data: Partial<CvTemplate>) => apiClient.post<CvTemplate>('/cms/cv-templates', data),
  update: (id: number, data: Partial<CvTemplate>) => apiClient.put<CvTemplate>(`/cms/cv-templates/${id}`, data),
  delete: (id: number) => apiClient.delete(`/cms/cv-templates/${id}`),
  toggleActive: (id: number) => apiClient.put<CvTemplate>(`/cms/cv-templates/${id}/toggle-active`),
  updateDisplayOrder: (id: number, displayOrder: number) => 
    apiClient.put<CvTemplate>(`/cms/cv-templates/${id}/display-order`, { displayOrder }),
};

// User CVs API
export const userCvsApi = {
  getAll: () => apiClient.get<UserCv[]>('/user-cvs'),
  getOne: (id: number) => apiClient.get<UserCv>(`/user-cvs/${id}`),
  create: (data: Partial<UserCv>) => apiClient.post<UserCv>('/user-cvs', data),
  update: (id: number, data: Partial<UserCv>) => apiClient.put<UserCv>(`/user-cvs/${id}`, data),
  delete: (id: number) => apiClient.delete(`/user-cvs/${id}`),
  downloadPdf: (id: number) => {
    return fetch(`${import.meta.env.VITE_API_URL}/user-cvs/${id}/download/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(res => res.blob());
  },
  downloadHtml: (id: number) => {
    return fetch(`${import.meta.env.VITE_API_URL}/user-cvs/${id}/download/html`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(res => res.blob());
  },
};

// CMS User CVs API (Admin)
export const cmsUserCvsApi = {
  getAll: () => apiClient.get<UserCv[]>('/cms/user-cvs'),
  getOne: (id: number) => apiClient.get<UserCv>(`/cms/user-cvs/${id}`),
};
