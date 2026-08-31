import { apiClient } from '../lib/api-client';
import { RevisionItem } from '../types';

export const revisionService = {
  async listQueue(): Promise<RevisionItem[]> {
    const res = await apiClient.get<RevisionItem[]>('/revision');
    return res.data;
  },

  async updateStatus(question_id: string, status: string, due_date?: string): Promise<RevisionItem> {
    const res = await apiClient.post<RevisionItem>('/revision/status', {
      question_id,
      status,
      due_date,
    });
    return res.data;
  },
};