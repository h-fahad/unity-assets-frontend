import { UserSubscription } from './subscription';

export interface User {
  id: number;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  subscription?: UserSubscription;
  downloadCount?: number;
}

export interface UserWithSubscriptionInfo extends User {
  subscription: UserSubscription | null;
  downloadCount: number;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'NONE';
  daysRemaining: number | null;
} 