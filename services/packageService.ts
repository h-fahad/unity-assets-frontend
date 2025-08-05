import api from '../lib/axios';
import { 
  SubscriptionPackage, 
  CreatePackageData, 
  UpdatePackageData,
  BillingCycle 
} from '../types/subscription';

export const packageService = {
  async getPackages(): Promise<SubscriptionPackage[]> {
    const response = await api.get('/packages');
    return response.data;
  },

  async getActivePackages(): Promise<SubscriptionPackage[]> {
    const response = await api.get('/packages/active');
    return response.data;
  },

  async getPackage(id: number): Promise<SubscriptionPackage> {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  async createPackage(data: CreatePackageData): Promise<SubscriptionPackage> {
    const response = await api.post('/packages', data);
    return response.data;
  },

  async updatePackage(id: number, data: UpdatePackageData): Promise<SubscriptionPackage> {
    const response = await api.patch(`/packages/${id}`, data);
    return response.data;
  },

  async deletePackage(id: number): Promise<void> {
    await api.delete(`/packages/${id}`);
  },

  async togglePackageStatus(id: number): Promise<SubscriptionPackage> {
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