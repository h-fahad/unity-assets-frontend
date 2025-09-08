import api from '../lib/axios';

export interface SubscriptionPlan {
  _id?: string; // MongoDB ObjectId
  id?: number; // For backward compatibility
  name: string;
  description?: string;
  basePrice: number;
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  yearlyDiscount: number;
  dailyDownloadLimit: number;
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  plan: SubscriptionPlan;
}

export interface CreatePlanData {
  name: string;
  description?: string;
  basePrice: number;
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  yearlyDiscount?: number;
  dailyDownloadLimit: number;
  features?: string[];
}

export interface UpdatePlanData extends Partial<CreatePlanData> {}

export interface AssignSubscriptionData {
  userId: number | string;
  planId: number | string;
  startDate?: string;
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/subscriptions/plans');
    // Handle MERN backend response format
    const data = response.data.data || response.data;
    return data.plans || data;
  },

  async createPlan(data: CreatePlanData): Promise<SubscriptionPlan> {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },

  async updatePlan(id: number, data: UpdatePlanData): Promise<SubscriptionPlan> {
    const response = await api.patch(`/subscriptions/${id}`, data);
    return response.data;
  },

  async deletePlan(id: number): Promise<void> {
    await api.delete(`/subscriptions/${id}`);
  },

  async assignPlan(data: AssignSubscriptionData): Promise<UserSubscription> {
    const response = await api.post('/subscriptions/assign', data);
    return response.data;
  },

  async getUserSubscriptions(): Promise<UserSubscription[]> {
    const response = await api.get('/subscriptions/users');
    return response.data;
  },

  async getMySubscriptions(): Promise<UserSubscription[]> {
    const response = await api.get('/subscriptions/my-subscriptions');
    return response.data;
  },

  async getMyActiveSubscription(): Promise<UserSubscription | null> {
    const response = await api.get('/subscriptions/my-active-subscription');
    return response.data;
  },

  async getAdminStats(): Promise<any> {
    const response = await api.get('/subscriptions/admin/stats');
    // Handle MERN backend response format
    return response.data.data || response.data;
  }
};

// Legacy function for backward compatibility
export async function getSubscriptionPlans() {
  const plans = await subscriptionService.getPlans();
  return plans.map(plan => ({
    id: (plan._id || plan.id || '').toString(),
    name: plan.name,
    price: plan.basePrice,
    dailyDownloadLimit: plan.dailyDownloadLimit,
    features: plan.features.length > 0 ? plan.features : [
      `${plan.name} plan features`,
      `${plan.billingCycle} billing`,
      `$${plan.basePrice} price`,
      `${plan.dailyDownloadLimit} downloads per day`,
    ],
  }));
} 