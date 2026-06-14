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

export const adminApi = {
  getMetrics: async () => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { metrics: Metrics };
    }>('/admin/metrics');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getAuditLogs: async (queryParams?: any) => {
    const response = await apiService.get('/admin/audit-logs', queryParams);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getSystemHealth: async () => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { health: SystemHealthData };
    }>('/admin/health');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  assignUserRole: async (userId: string, role: string) => {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { user: any };
    }>(`/admin/users/${userId}/role`, { role });
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
