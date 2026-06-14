import { apiService } from '../../../shared/services/api';

export interface BusLocation {
  trip_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

export interface NearbyTrip {
  location: BusLocation;
  trip: {
    id: string;
    bus_id: string;
    driver_id: string;
    route_description: string;
    origin: string;
    destination: string;
    fare: number;
    currency: string;
    scheduled_start_time: string;
    actual_start_time?: string;
    actual_end_time?: string;
    status: string;
    total_capacity: number;
    avg_speed_kmh: number;
  };
}

export const trackingApi = {
  getLocationByTripId: async (tripId: string) => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { location: BusLocation };
    }>(`/tracking/location/${tripId}`);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getNearbyActiveTrips: async (params: {
    latitude: number;
    longitude: number;
    radius_km?: number;
  }) => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { trips: NearbyTrip[] };
    }>('/tracking/nearby', params);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
