import { apiClient } from '../lib/api-client';
import { AnalyticsOverview } from '../types';

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    const res = await apiClient.get<AnalyticsOverview>('/analytics');
    return res.data;
  },
};