import axios from 'axios';
import { authService } from './auth.service';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.baseUrl;

export interface BaseSearchDto {
  offset?: number;
  limit?: number;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalUnread: number;
    totalPages: number;
  };
}

const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = async (params: BaseSearchDto = {}): Promise<NotificationResponse> => {
  try {
    const response = await axios.get(`${API_URL}/data/notification`, {
      params,
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await axios.put(
      `${API_URL}/data/notification/${notificationId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authService.logout();
    }
    throw error;
  }
}; 