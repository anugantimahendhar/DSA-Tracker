import { apiClient } from '../lib/api-client';
import { CodeRunResponse, CodeSubmitResponse } from '../types';

export const compilerService = {
  async runCode(question_id: string, language: string, code: string): Promise<CodeRunResponse> {
    const res = await apiClient.post<CodeRunResponse>('/code/run', {
      question_id,
      language,
      code,
    });
    return res.data;
  },

  async submitCode(question_id: string, language: string, code: string): Promise<CodeSubmitResponse> {
    const res = await apiClient.post<CodeSubmitResponse>('/code/submit', {
      question_id,
      language,
      code,
    });
    return res.data;
  },

  async saveDraft(question_id: string, language: string, code: string): Promise<void> {
    await apiClient.post('/code/drafts', {
      question_id,
      language,
      code,
    });
  },

  async getDraft(question_id: string, language: string): Promise<{ code: string | null; language: string }> {
    const res = await apiClient.get(`/code/drafts/${question_id}?language=${language}`);
    return res.data;
  },
};