import { apiClient } from '../lib/api-client';
import { AIQuestionDraft, LeaderboardResponse } from '../types';

export const aiService = {
  async generateQuestion(question: string): Promise<AIQuestionDraft> {
    const res = await apiClient.post<AIQuestionDraft>('/ai/generate-question', { question });
    return res.data;
  },

  async getLeaderboard(): Promise<LeaderboardResponse> {
    const res = await apiClient.get<LeaderboardResponse>('/ai/leaderboard');
    return res.data;
  },
};
