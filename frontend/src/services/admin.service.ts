import { apiClient } from '../lib/api-client';
import { AdminStats, QuestionDetail, TestCase } from '../types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await apiClient.get<AdminStats>('/admin/stats');
    return res.data;
  },

  async listAllQuestions(): Promise<QuestionDetail[]> {
    const res = await apiClient.get<QuestionDetail[]>('/admin/questions');
    return res.data;
  },

  async createQuestion(data: any): Promise<QuestionDetail> {
    const res = await apiClient.post<QuestionDetail>('/admin/questions', data);
    return res.data;
  },

  async updateQuestion(id: string, data: any): Promise<QuestionDetail> {
    const res = await apiClient.put<QuestionDetail>(`/admin/questions/${id}`, data);
    return res.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/admin/questions/${id}`);
  },

  async listTestCases(questionId: string): Promise<TestCase[]> {
    const res = await apiClient.get<TestCase[]>(`/admin/questions/${questionId}/test-cases`);
    return res.data;
  },

  async createTestCase(questionId: string, data: Partial<TestCase>): Promise<TestCase> {
    const res = await apiClient.post<TestCase>(`/admin/questions/${questionId}/test-cases`, data);
    return res.data;
  },

  async deleteTestCase(testCaseId: string): Promise<void> {
    await apiClient.delete(`/admin/test-cases/${testCaseId}`);
  },
};