import { apiService } from '../../../shared/services/api';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: 'passenger' | 'driver' | 'traffic_authority' | 'garage_manager' | 'fuel_station_manager' | 'system_admin';
  is_active: boolean;
  last_role_changed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  role: string;
  profile_status: 'INCOMPLETE' | 'PENDING_VERIFICATION' | 'COMPLETE' | 'VERIFIED';
  profile_data?: Record<string, any>;
  draft_data?: Record<string, any>;
  rejection_reason?: string;
  promoted_at?: string;
  submitted_at?: string;
  verified_at?: string;
  verifier_admin_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  profile: Profile;
  profile_completion_required: boolean;
  incomplete_role?: string;
  rejection_reason?: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
  purpose?: string;
  new_email?: string;
  new_phone?: string;
  new_password?: string;
}

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await apiService.post<{ success: boolean; message: string; data: { expiresAt: string; userId: string } }>(
      '/auth/register',
      data
    );
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  login: async (data: LoginRequest) => {
    const response = await apiService.post<{ success: boolean; message: string; data: { expiresAt: string; userId: string } }>(
      '/auth/login',
      data
    );
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    const response = await apiService.post<{ success: boolean; message: string; data: AuthResponse | any }>(
      '/auth/verify-otp',
      data
    );
    
    // The backend wraps the actual data in a `data` field!
    const actualData = (response.data as any).data;
    
    if ('accessToken' in actualData) {
      apiService.setToken(actualData.accessToken);
      return actualData as AuthResponse;
    }
    
    return actualData;
  },

  sendChangeEmailOtp: async (data: { new_email: string }) => {
    const response = await apiService.post<{ success: boolean; message: string; data: { success: boolean; expiresAt: string } }>(
      '/auth/change-email/send-otp',
      data
    );
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  sendChangePhoneOtp: async (data: { new_phone: string }) => {
    const response = await apiService.post<{ success: boolean; message: string; data: { success: boolean; expiresAt: string } }>(
      '/auth/change-phone/send-otp',
      data
    );
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  sendChangePasswordOtp: async (data: { old_password: string; new_password: string }) => {
    const response = await apiService.post<{ success: boolean; message: string; data: { success: boolean; expiresAt: string } }>(
      '/auth/change-password/send-otp',
      data
    );
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  logout: async () => {
    await apiService.post('/auth/logout', {});
    apiService.setToken(null);
  },

  me: async () => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: {
        user: User;
        profile: Profile;
        profile_completion_required: boolean;
        incomplete_role?: string;
        rejection_reason?: string;
      }
    }>('/auth/me');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
