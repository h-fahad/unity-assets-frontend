import api from '../lib/axios';

export interface CreateCheckoutSessionData {
  planId: number;
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const paymentService = {
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSessionResponse> {
    const response = await api.post('/payments/create-checkout-session', data);
    return response.data;
  },
}; 