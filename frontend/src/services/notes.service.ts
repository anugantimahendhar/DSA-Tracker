import { apiClient } from '../lib/api-client';

export const notesService = {
  async getNote(question_id: string): Promise<{ content: string; updated_at: string }> {
    const res = await apiClient.get(`/notes/${question_id}`);
    return res.data;
  },

  async saveNote(question_id: string, content: string): Promise<{ content: string; updated_at: string }> {
    const res = await apiClient.post('/notes', {
      question_id,
      content,
    });
    return res.data;
  },
};