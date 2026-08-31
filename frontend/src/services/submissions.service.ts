import { apiClient } from '../lib/api-client';
import { Submission, SubmissionDetail } from '../types';

export const submissionsService = {
  async listForQuestion(question_id: string): Promise<Submission[]> {
    const res = await apiClient.get<Submission[]>(`/submissions/question/${question_id}`);
    return res.data;
  },

  async getDetail(submission_id: string): Promise<SubmissionDetail> {
    const res = await apiClient.get<SubmissionDetail>(`/submissions/${submission_id}`);
    return res.data;
  },
};