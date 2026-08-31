import { apiClient } from '../lib/api-client';
import { UserProgressSummary } from '../types';

export const progressService = {
  async getSummary(): Promise<UserProgressSummary> {
    const res = await apiClient.get<UserProgressSummary>('/progress');
    return res.data;
  },
};