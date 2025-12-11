import apiClient from './client';

export interface AboutPageContent {
  id: number;
  hero_title: string;
  hero_subtitle?: string;
  hero_image?: string;
  mission_title?: string;
  mission_content?: string;
  vision_title?: string;
  vision_content?: string;
  values_title?: string;
  values_content?: string;
  story_title?: string;
  story_content?: string;
  team_title?: string;
  team_subtitle?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateAboutPageDto {
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  mission_title?: string;
  mission_content?: string;
  vision_title?: string;
  vision_content?: string;
  values_title?: string;
  values_content?: string;
  story_title?: string;
  story_content?: string;
  team_title?: string;
  team_subtitle?: string;
}

export const aboutPageAPI = {
  getAboutPage: async (): Promise<AboutPageContent> => {
    const { data } = await apiClient.get('/cms/about-page');
    return data;
  },

  updateAboutPage: async (dto: UpdateAboutPageDto): Promise<AboutPageContent> => {
    const { data } = await apiClient.put('/cms/about-page', dto);
    return data;
  },
};
