export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface SubscriptionPackage {
  id: string; // MongoDB ObjectId is a string
  name: string;
  description: string;
  basePrice: number;
  billingCycle: BillingCycle;
  yearlyDiscount: number; // percentage discount for yearly plans
  dailyDownloadLimit: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationInDays: number;
  dailyDownloadLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
}

export interface CreateSubscriptionData {
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  downloadLimit?: number;
}

export interface CreatePackageData {
  name: string;
  description: string;
  basePrice: number;
  billingCycle: BillingCycle;
  yearlyDiscount: number;
  dailyDownloadLimit: number;
  features: string[];
}

export interface UpdatePackageData extends Partial<CreatePackageData> {
  isActive?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalDownloads: number;
  totalAssets: number;
} 