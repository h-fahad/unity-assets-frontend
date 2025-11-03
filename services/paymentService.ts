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

export interface CurrentSubscription {
  hasSubscription: boolean;
  subscription: {
    id: string;
    stripeSubscriptionId: string;
    plan: {
      _id: string;
      name: string;
      basePrice: number;
      dailyDownloadLimit: number;
      billingCycle: string;
    };
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    startDate: string;
    endDate: string;
  } | null;
}

export interface ChangeSubscriptionResponse {
  message: string;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
    newPlan: {
      id: string;
      name: string;
      price: number;
    };
    isUpgrade: boolean;
    effectiveDate: string;
  };
}

export interface CustomerPortalResponse {
  url: string;
}

export const paymentService = {
  // Create Stripe checkout session for subscription
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSessionResponse> {
    const response = await api.post('/payments/create-checkout-session', data);
    return response.data.data;
  },

  // Create customer portal session
  async createCustomerPortalSession(): Promise<CustomerPortalResponse> {
    const response = await api.post('/payments/create-portal-session');
    return response.data.data;
  },

  // Get subscription status
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await api.get('/payments/subscription-status');
    return response.data.data;
  },

  // Cancel subscription
  async cancelSubscription(): Promise<{ cancelAtPeriodEnd: boolean; currentPeriodEnd: string }> {
    const response = await api.post('/payments/cancel-subscription');
    return response.data.data;
  },

  // Reactivate subscription
  async reactivateSubscription(): Promise<{ cancelAtPeriodEnd: boolean }> {
    const response = await api.post('/payments/reactivate-subscription');
    return response.data.data;
  },

  // Create manual subscription (development only)
  async createManualSubscription(data: { planId: string; billingCycle?: string }): Promise<any> {
    const response = await api.post('/payments/create-subscription-manual', data);
    return response.data.data;
  },

  // Get current subscription
  async getCurrentSubscription(): Promise<CurrentSubscription> {
    const response = await api.get('/payments/my-subscription');
    return response.data.data;
  },

  // Change subscription (upgrade/downgrade)
  async changeSubscription(newPlanId: string): Promise<ChangeSubscriptionResponse> {
    const response = await api.post('/payments/change-subscription', { newPlanId });
    return response.data;
  }
}; 