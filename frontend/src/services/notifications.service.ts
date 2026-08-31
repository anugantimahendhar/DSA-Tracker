import { apiClient } from '../lib/api-client';
import { NotificationItem } from '../types';

export const notificationsService = {
  async list(): Promise<NotificationItem[]> {
    const { data } = await apiClient.get('/notifications');
    return data;
  },
  async markRead(id: string): Promise<NotificationItem | null> {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data;
  },
  async markAllRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },
};
