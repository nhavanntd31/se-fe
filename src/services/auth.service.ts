import axios, { AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.baseUrl;

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  isVerified: boolean;
}

export enum UserPermission {
  USER_ALL = 'user_all',
  USER_PCLO = 'user_pclo'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permission: UserPermission;
}

class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  removeTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async login(credentials: LoginDto): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { accessToken, refreshToken, isVerified } = response.data;
      
      this.setToken(accessToken);
      this.setRefreshToken(refreshToken);
      
      return { accessToken, refreshToken, isVerified };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async getUserInfo(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${API_URL}/auth/user-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      await axios.put(`${API_URL}/auth/change-password`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  logout(): void {
    this.removeTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

export const authService = AuthService.getInstance(); 