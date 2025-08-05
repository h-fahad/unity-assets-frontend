import api from '../lib/axios';

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationInDays: number;
  createdAt: string;
  updatedAt: string;
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
  price: number;
  durationInDays: number;
}

export interface UpdatePlanData extends Partial<CreatePlanData> {}

export interface AssignSubscriptionData {
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  downloadLimit?: number;
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/subscriptions');
    return response.data;
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
    return response.data;
  }
};

// Legacy function for backward compatibility
export async function getSubscriptionPlans() {
  const plans = await subscriptionService.getPlans();
  return plans.map(plan => ({
    id: plan.id.toString(),
    name: plan.name,
    price: plan.price,
    dailyDownloadLimit: plan.durationInDays, // This is a mapping - adjust as needed
    features: [
      `${plan.name} plan features`,
      `${plan.durationInDays} days duration`,
      `$${plan.price} price`,
    ],
  }));
} 