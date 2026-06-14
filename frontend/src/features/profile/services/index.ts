import { apiService } from '../../../shared/services/api';
import type { Profile } from '../../../providers/AuthProvider';

export interface ProfileField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'file';
  required: boolean;
  options?: { value: string; label: string }[];
}

export const profileApi = {
  getProfile: async (): Promise<{ profile: Profile }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { profile: Profile };
    }>('/profile');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getProfileSchema: async (): Promise<{ schema: ProfileField[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { schema: ProfileField[] };
    }>('/profile/schema');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  completeProfile: async (data: Record<string, any>): Promise<{ profile: Profile }> => {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { profile: Profile };
    }>('/profile/complete', data);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
