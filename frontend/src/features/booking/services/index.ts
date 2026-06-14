import { apiService } from '../../../shared/services/api';
import { Trip } from '../trip/services';

export interface Booking {
  id: string;
  passenger_id: string;
  trip_id: string;
  seat_number: number;
  status: 'reserved' | 'payment_pending' | 'confirmed' | 'failed' | 'expired';
  expires_at: string;
  idempotency_key: string;
  trip?: Trip;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingRequest {
  trip_id: string;
  seat_number: number;
  idempotency_key: string;
}

export const bookingApi = {
  createBooking: async (data: CreateBookingRequest) => {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { booking: Booking };
    }>('/bookings', data);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getMyBookings: async () => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { bookings: Booking[] };
    }>('/bookings/my');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  cancelBooking: async (id: string) => {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { booking: Booking };
    }>(`/bookings/${id}/cancel`, {});
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
