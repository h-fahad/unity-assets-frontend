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
  _id: string;
  id?: number; // For backward compatibility
  name?: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userSubscriptions?: any[];
  _count?: {
    downloads: number;
    assets: number;
  };
}

export interface UserProfile {
  _id?: string;
  id?: number; // For backward compatibility
  name?: string;
  email: string;
  role: string;
  createdAt: string;
  userSubscriptions?: Array<{
    _id?: string;
    id?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    plan: {
      _id?: string;
      id?: number;
      name: string;
      description?: string;
      dailyDownloadLimit: number;
      basePrice: number;
      billingCycle: string;
    };
  }>;
  _count?: {
    downloads: number;
    assets: number;
  };
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/profile');
    // Handle MERN backend response format
    const profileData = response.data.data || response.data;
    return profileData.user || profileData;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data; // NestJS backend returns data directly
  },

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: UserWithStats[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    // Handle MERN backend response format
    return response.data.data || response.data;
  },

  async createUser(data: CreateUserData): Promise<User> {
    try {
      const response = await api.post('/users', data);
      // Handle MERN backend response format
      const userData = response.data.data?.user || response.data.user || response.data;
      return userData;
    } catch (error: any) {
      // Extract error message from axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to create user');
    }
  },

  async updateUser(id: string | number, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, data);
      // Handle MERN backend response format
      const userData = response.data.data?.user || response.data.user || response.data;
      return userData;
    } catch (error: any) {
      // Extract error message from axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to update user');
    }
  },

  async deleteUser(id: string | number): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      // Extract error message from axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  async activateUser(id: string | number): Promise<User> {
    return this.toggleUserStatus(id, true);
  },

  async deactivateUser(id: string | number): Promise<User> {
    return this.toggleUserStatus(id, false);
  },

  async toggleUserStatus(id: string | number, isActive: boolean): Promise<User> {
    try {
      const response = await api.patch(`/users/${id}/status`, { isActive });
      // Handle MERN backend response format
      const userData = response.data.data?.user || response.data.user || response.data;
      return userData;
    } catch (error: any) {
      // Extract error message from axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to update user status');
    }
  },

  async changeUserRole(id: string | number, role: 'USER' | 'ADMIN'): Promise<User> {
    try {
      const response = await api.patch(`/users/${id}/role`, { role });
      // Handle MERN backend response format
      const userData = response.data.data?.user || response.data.user || response.data;
      return userData;
    } catch (error: any) {
      // Extract error message from axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to change user role');
    }
  },

  async searchUsers(query: string): Promise<{ users: UserWithStats[]; pagination: any }> {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getUserStats(): Promise<any> {
    const response = await api.get('/users/stats');
    // Handle MERN backend response format
    return response.data.data || response.data;
  },

  async getUsersWithSubscriptions(): Promise<any[]> {
    const response = await api.get('/users/subscriptions');
    return response.data;
  }
}; 