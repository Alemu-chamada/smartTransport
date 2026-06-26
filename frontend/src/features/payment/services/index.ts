import { apiService } from '../../../shared/services/api';

export interface PaymentSession {
  payment: { id: string; booking_id: string; amount: number; currency: string; gateway_status: string };
  client_secret: string;
  publishable_key: string;
  mode?: 'stripe' | 'simulated';
}

export const paymentApi = {
  createPaymentSession: async (data: { booking_id: string }): Promise<PaymentSession> => {
    const response = await apiService.post<{ success: boolean; message: string; data: PaymentSession }>('/payment/create', data);
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },

  confirmPayment: async (data: { payment_intent_id?: string; booking_id?: string }): Promise<{ success: boolean; booking_id: string }> => {
    const response = await apiService.post<{ success: boolean; message: string; data: { success: boolean; booking_id: string } }>('/payment/confirm', data);
    if (!response?.data?.data) throw new Error('Invalid response from server');
    return response.data.data;
  },
};
