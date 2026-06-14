import { apiService } from '../../../shared/services/api';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const notificationApi = {
  getMyNotifications: async (): Promise<{ notifications: Notification[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { notifications: Notification[] };
    }>('/notifications/my');
    if (!response?.data?.data) {
      return { notifications: [] }; // Graceful fallback if backend route doesn't exist yet
    }
    return response.data.data;
  },
  markAsRead: async (id: string): Promise<void> => {
    try {
      await apiService.patch<{
        success: boolean;
        message: string;
        data: { notification: Notification };
      }>(`/notifications/${id}/read`);
    } catch {
      // Graceful fallback if backend route doesn't exist yet
    }
  },
  sendToAll: async (data: { title: string; content: string }) => {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { notifications: Notification[] };
    }>('/notifications/send-to-all', data);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
