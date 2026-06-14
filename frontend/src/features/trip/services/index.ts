import { apiService } from '../../../shared/services/api';

export interface Trip {
  id: string;
  bus_id: string;
  driver_id: string;
  route_description: string;
  origin: string;
  destination: string;
  fare: number;
  currency: string;
  stops: any[];
  scheduled_start_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'active' | 'completed' | 'canceled';
  total_capacity: number;
  avg_speed_kmh: number;
  created_at: string;
  updated_at: string;
}

export interface Bus {
  id: string;
  plate_number: string;
  capacity: number;
  driver_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTripRequest {
  bus_id: string;
  driver_id: string;
  route_description: string;
  origin: string;
  destination: string;
  fare: number;
  currency?: string;
  stops?: any[];
  scheduled_start_time: string;
  status?: string;
  total_capacity: number;
  avg_speed_kmh?: number;
}

export interface CreateTripRequest {
  bus_id?: string;
  driver_id?: string;
  route_description?: string;
  origin: string;
  destination: string;
  fare: number;
  currency?: string;
  stops?: any[];
  scheduled_start_time: string;
  total_capacity: number;
  avg_speed_kmh?: number;
}

export const tripApi = {
  getScheduledTrips: async () => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { trips: Trip[] };
    }>('/trips/scheduled');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getNearbyTrips: async (params?: {
    origin?: string;
    destination?: string;
  }) => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { trips: Trip[] };
    }>('/trips/nearby', params);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getTripById: async (tripId: string) => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { trip: Trip };
    }>(`/trips/${tripId}`);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getTripOccupiedSeats: async (tripId: string) => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { occupiedSeats: number[] };
    }>(`/trips/${tripId}/occupied-seats`);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  createTrip: async (data: CreateTripRequest) => {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: any;
    }>('/trips', data);
    if (!response?.data?.success) {
      throw new Error('Invalid response from server');
    }
    return response.data;
  },
};
