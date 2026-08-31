import { apiClient } from '../lib/api-client';
import { QuestionListItem, QuestionDetail } from '../types';

export interface QuestionFilters {
  difficulty?: string;
  topic?: string;
  pattern?: string;
  search?: string;
  user_status?: string;
  bookmarked_only?: boolean;
  limit?: number;
  offset?: number;
}

export const questionsService = {
  async listQuestions(filters: QuestionFilters = {}): Promise<QuestionListItem[]> {
    const params = new URLSearchParams();
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.topic) params.append('topic', filters.topic);
    if (filters.pattern) params.append('pattern', filters.pattern);
    if (filters.search) params.append('search', filters.search);
    if (filters.user_status) params.append('user_status', filters.user_status);
    if (filters.bookmarked_only) params.append('bookmarked_only', 'true');
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));

    const res = await apiClient.get<QuestionListItem[]>(`/questions?${params.toString()}`);
    return res.data;
  },

  async getQuestion(id: string): Promise<QuestionDetail> {
    const res = await apiClient.get<QuestionDetail>(`/questions/${id}`);
    return res.data;
  },
};