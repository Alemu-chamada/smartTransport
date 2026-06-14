import { apiService } from '../../../shared/services/api';

export type ServiceType = 'garage' | 'fuel_station';

export interface Service {
  id: string;
  type: ServiceType;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const serviceApi = {
  getAllServices: async (): Promise<{ services: Service[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { services: Service[] };
    }>('/services');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getNearbyServices: async (params: {
    latitude: number;
    longitude: number;
    radius_km?: number;
    type?: ServiceType;
  }): Promise<{ services: Service[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { services: Service[] };
    }>('/services/nearby', params);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
