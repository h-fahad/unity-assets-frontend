import api from '../lib/axios';
import { 
  SubscriptionPackage, 
  CreatePackageData, 
  UpdatePackageData,
  BillingCycle 
} from '../types/subscription';

export const packageService = {
  async getPackages(): Promise<SubscriptionPackage[]> {
    const response = await api.get('/subscriptions/plans?source=database');
    // API returns { success: true, data: { plans: [...] } }
    const plans = response.data.data?.plans || response.data.data || [];

    // Transform backend data to frontend format
    return plans.map((plan: any) => ({
      ...plan,
      id: plan._id || plan.id // Transform _id to id
    }));
  },

  async getActivePackages(): Promise<SubscriptionPackage[]> {
    const response = await api.get('/subscriptions/plans?source=database');
    // API returns { success: true, data: { plans: [...] } }
    const plans = response.data.data?.plans || response.data.data || [];

    // Transform backend data to frontend format and filter active plans
    return plans
      .filter((plan: any) => plan.isActive)
      .map((plan: any) => ({
        ...plan,
        id: plan._id || plan.id // Transform _id to id
      }));
  },

  async getPackage(id: string): Promise<SubscriptionPackage> {
    const response = await api.get(`/subscriptions/plans/${id}`);
    const plan = response.data;
    
    // Transform backend data to frontend format
    return {
      ...plan,
      id: plan._id // Transform _id to id
    };
  },

  async createPackage(data: CreatePackageData): Promise<SubscriptionPackage> {
    const response = await api.post('/packages', data);
    return response.data;
  },

  async updatePackage(id: string, data: UpdatePackageData): Promise<SubscriptionPackage> {
    const response = await api.patch(`/packages/${id}`, data);
    return response.data;
  },

  async deletePackage(id: string): Promise<void> {
    await api.delete(`/packages/${id}`);
  },

  async togglePackageStatus(id: string): Promise<SubscriptionPackage> {
    const response = await api.patch(`/packages/${id}/toggle-status`);
    return response.data;
  },

  // Helper functions for pricing calculations
  calculateActualPrice(basePrice: number, billingCycle: BillingCycle, yearlyDiscount: number): number {
    if (billingCycle === 'YEARLY') {
      return basePrice * (1 - yearlyDiscount / 100);
    }
    return basePrice;
  },

  calculateYearlySavings(basePrice: number, yearlyDiscount: number): number {
    const monthlyTotal = basePrice * 12;
    const yearlyPrice = basePrice * (1 - yearlyDiscount / 100);
    return monthlyTotal - yearlyPrice;
  }
};