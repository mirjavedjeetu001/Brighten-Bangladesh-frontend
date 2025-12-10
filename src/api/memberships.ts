import apiClient from './client';
import { Membership, UserActivity, EligibilityResult } from './types';

export const membershipsApi = {
  getMyMembership: async (): Promise<Membership | null> => {
    const response = await apiClient.get('/memberships/me');
    return response.data;
  },

  checkEligibility: async (): Promise<EligibilityResult> => {
    const response = await apiClient.post('/memberships/check');
    return response.data;
  },

  applyForMembership: async (): Promise<Membership> => {
    const response = await apiClient.post('/memberships/apply');
    return response.data;
  },

  getMyActivities: async (): Promise<UserActivity[]> => {
    const response = await apiClient.get('/memberships/activities/me');
    return response.data;
  },

  getAllMemberships: async (): Promise<Membership[]> => {
    const response = await apiClient.get('/memberships');
    return response.data;
  },

  checkUserEligibility: async (userId: number): Promise<EligibilityResult> => {
    const response = await apiClient.post(`/memberships/user/${userId}/check`);
    return response.data;
  },

  createActivity: async (data: {
    userId: number;
    type: string;
    meta: any;
  }): Promise<UserActivity> => {
    const response = await apiClient.post('/memberships/activities', data);
    return response.data;
  },
};
