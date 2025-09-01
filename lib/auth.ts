import api from './axios';

export interface User {
  _id?: string;
  id?: number; // For backward compatibility
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  resetToken?: string | null;
  resetTokenExpiry?: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      
      // Handle MERN backend response format
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      // MERN backend returns data in response.data.data
      const authData = response.data.data || response.data;
      const { access_token, user } = authData;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { access_token, user };
    } catch (error: any) {
      // Extract error message from axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Login failed');
    }
  },

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.post('/auth/register', data);
      
      // Handle MERN backend response format
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      // MERN backend returns data in response.data.data
      const authData = response.data.data || response.data;
      return authData.user || authData;
    } catch (error: any) {
      // Extract error message from axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Registration failed');
    }
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    
    // Handle MERN backend response format
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Failed to get profile');
    }
    
    // MERN backend returns data in response.data.data
    const profileData = response.data.data || response.data;
    return profileData.user || profileData;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }
}; 