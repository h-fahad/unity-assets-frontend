import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await apiClient.post('/auth/refresh');
        const { access_token } = response.data.data;
        
        localStorage.setItem('access_token', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface RegisterData {
  name?: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      _id: string;
      email: string;
      name?: string;
      role: string;
      isEmailVerified: boolean;
      createdAt: string;
    };
  };
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

class AuthService {
  // Enhanced registration with email verification
  async register(data: RegisterData): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/signup', data);
    return response.data;
  }

  // Enhanced login with account lockout handling
  async login(data: LoginData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', data);
    
    // Store access token in localStorage
    if (response.data.data.access_token) {
      localStorage.setItem('access_token', response.data.data.access_token);
    }
    
    return response.data;
  }

  // Logout with refresh token cleanup
  async logout(): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/logout');
      localStorage.removeItem('access_token');
      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('access_token');
      throw error;
    }
  }

  // Email verification
  async verifyEmail(token: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  }

  // Email verification with OTP
  async verifyEmailOTP(email: string, otp: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/verify-email-otp', { email, otp });
    return response.data;
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  }

  // Request password reset (sends OTP)
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  }

  // Reset password with OTP
  async resetPassword(data: PasswordResetData): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/reset-password', data);
    return response.data;
  }

  // Change password (authenticated user)
  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/change-password', data);
    return response.data;
  }

  // Refresh access token
  async refreshToken(): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/refresh');
    
    if (response.data.data.access_token) {
      localStorage.setItem('access_token', response.data.data.access_token);
    }
    
    return response.data;
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.get('/auth/profile');
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem('access_token');
  }

  // Legacy methods for backward compatibility
  async loginUser(data: LoginData): Promise<AuthResponse> {
    return this.login(data);
  }

  async registerUser(data: RegisterData): Promise<ApiResponse> {
    return this.register(data);
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.requestPasswordReset(email);
  }

  async resetPasswordWithToken(data: { token: string; password: string }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/reset-password-confirm', data);
    return response.data;
  }
}

export const authService = new AuthService();
export default authService;
