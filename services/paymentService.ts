import api from '../lib/axios';

export interface CreateCheckoutSessionData {
  planId: string;
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    planId: string;
    startDate: string;
    endDate: string;
    stripeStatus: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  } | null;
}

export const paymentService = {
  // Create Stripe checkout session for subscription
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSessionResponse> {
    const response = await api.post('/payments/create-checkout-session', data);
    return response.data.data;
  },

  // Get subscription status
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await api.get('/payments/subscription-status');
    return response.data.data;
  },

  // Create manual subscription (development only)
  async createManualSubscription(data: { planId: string; billingCycle?: string }): Promise<any> {
    const response = await api.post('/payments/create-subscription-manual', data);
    return response.data.data;
  }
}; 