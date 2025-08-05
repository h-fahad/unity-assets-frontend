import api from '../lib/axios';
import { User } from '../lib/auth';

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface UserWithStats {
  id: number;
  name?: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userSubscriptions: any[];
  _count: {
    downloads: number;
    assets: number;
  };
}

export interface UserProfile {
  id: number;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
  userSubscriptions: Array<{
    id: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    plan: {
      id: number;
      name: string;
      description?: string;
      dailyDownloadLimit: number;
      basePrice: number;
      billingCycle: string;
    };
  }>;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async getAllUsers(): Promise<{ users: UserWithStats[]; pagination: any }> {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async activateUser(id: number): Promise<User> {
    const response = await api.patch(`/users/${id}/activate`);
    return response.data;
  },

  async deactivateUser(id: number): Promise<User> {
    const response = await api.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  async changeUserRole(id: number, role: 'USER' | 'ADMIN'): Promise<User> {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  async searchUsers(query: string): Promise<{ users: UserWithStats[]; pagination: any }> {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getUserStats(): Promise<any> {
    const response = await api.get('/users/stats');
    return response.data;
  },

  async getUsersWithSubscriptions(): Promise<any[]> {
    const response = await api.get('/users/subscriptions');
    return response.data;
  }
}; 