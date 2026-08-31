import { apiClient } from '../lib/api-client';
import { UserProfile } from '../types';

export const authService = {
  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>('/auth/me');
    return res.data;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiClient.put<UserProfile>('/auth/profile', updates);
    return res.data;
  },
};