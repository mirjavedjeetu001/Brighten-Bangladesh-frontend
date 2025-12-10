import apiClient from './client';

export interface SystemSettings {
  id: number;
  siteName: string;
  siteTagline?: string;
  siteLogo?: string;
  siteFavicon?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  metaDescription?: string;
  metaKeywords?: string;
  memberBlogLimit: number;
  blogLimitPeriodDays: number;
  volunteerBlogLimit: number;
  editorBlogLimit: number;
  minBlogsForMembership: number;
  minEventsForMembership: number;
  minProjectsForMembership: number;
  footerText?: string;
  copyrightText?: string;
  createdAt: string;
  updatedAt: string;
}

export const settingsApi = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  updateSettings: async (updates: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await apiClient.put('/settings', updates);
    return response.data;
  },
};
