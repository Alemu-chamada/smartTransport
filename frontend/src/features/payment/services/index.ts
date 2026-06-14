import { apiService } from '../../../shared/services/api';

export interface CreatePaymentSessionRequest {
  booking_id: string;
}

export const paymentApi = {
  createPaymentSession: async (data: CreatePaymentSessionRequest) => {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: any;
    }>('/payment/create', data);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
