import { apiClient } from '../lib/api-client';

export const bookmarksService = {
  async listIds(): Promise<string[]> {
    const res = await apiClient.get<string[]>('/bookmarks');
    return res.data;
  },

  async toggle(question_id: string): Promise<boolean> {
    const res = await apiClient.post<{ question_id: string; is_bookmarked: boolean }>(`/bookmarks/${question_id}`);
    return res.data.is_bookmarked;
  },
};