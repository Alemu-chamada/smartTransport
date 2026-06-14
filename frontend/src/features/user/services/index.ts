import { apiService } from '../../../shared/services/api';
import type { User } from '../../../providers/AuthProvider';

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
}

export interface UpdateUserResponse {
  user: User;
}

export const userApi = {
  updateMe: async (data: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await apiService.put<{
      success: boolean;
      message: string;
      data: UpdateUserResponse;
    }>('/users/me', data);

    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }

    return response.data.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { user: User };
    }>('/users/me');

    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }

    return response.data.data;
  },

  getUsers: async (): Promise<{ users: User[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { users: User[] };
    }>('/users');

    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }

    return response.data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<{ user: User }> => {
    const response = await apiService.put<{
      success: boolean;
      message: string;
      data: { user: User };
    }>(`/users/${userId}/role`, { role });

    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }

    return response.data.data;
  },

  deleteMe: async (): Promise<void> => {
    await apiService.delete<{ success: boolean; message: string }>('/users/me');
  },
};
