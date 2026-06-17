import { apiService } from '../../../shared/services/api';

export interface Metrics {
  total_users: number;
  total_trips: number;
  total_bookings: number;
  active_drivers: number;
  total_revenue: number;
}

export interface SystemHealthData {
  database: boolean;
  redis: boolean;
}

export interface Bus {
  id: string;
  plate_number: string;
  capacity: number;
  is_active: boolean;
  driver_id?: string;
}

export interface Driver {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
}

export const adminApi = {
  getMetrics: async () => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { metrics: Metrics };
    }>('/admin/metrics');
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },

  getAuditLogs: async (queryParams?: any) => {
    const response = await apiService.get('/admin/audit-logs', queryParams);
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },

  getSystemHealth: async () => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { health: SystemHealthData };
    }>('/admin/health');
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },

  assignUserRole: async (userId: string, role: string) => {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { user: any };
    }>(`/admin/users/${userId}/role`, { role });
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },

  getBuses: async (): Promise<{ buses: Bus[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { buses: Bus[] };
    }>('/admin/buses');
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },

  getDrivers: async (): Promise<{ drivers: Driver[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { drivers: Driver[] };
    }>('/admin/drivers');
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },

  getUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { users: any[]; total: number; page: number; limit: number };
    }>('/admin/users', params);
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },
};
