import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ============ Auth Endpoints ============

export const authApi = {
  register: async (email: string, password: string, organizationName: string) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      organizationName,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  getApiKeys: async () => {
    const response = await apiClient.get('/auth/api-keys');
    return response.data;
  },

  createApiKey: async (name: string) => {
    const response = await apiClient.post('/auth/api-keys', { name });
    return response.data;
  },

  toggleApiKey: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/auth/api-keys/${id}`, { isActive });
    return response.data;
  },
};

// ============ Device Endpoints ============

export const deviceApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/devices/dashboard');
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/devices/stats');
    return response.data;
  },

  getDevices: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/devices', {
      params: { page, limit },
    });
    return response.data;
  },

  getDevice: async (id: string) => {
    const response = await apiClient.get(`/devices/${id}`);
    return response.data;
  },

  deleteDevice: async (id: string) => {
    const response = await apiClient.delete(`/devices/${id}`);
    return response.data;
  },
};

// ============ Alert Endpoints ============

export const alertApi = {
  getAlerts: async (page = 1, limit = 10, unresolved = false) => {
    const response = await apiClient.get('/alerts', {
      params: { page, limit, unresolved },
    });
    return response.data;
  },

  getAlert: async (id: string) => {
    const response = await apiClient.get(`/alerts/${id}`);
    return response.data;
  },

  resolveAlert: async (id: string) => {
    const response = await apiClient.patch(`/alerts/${id}/resolve`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/alerts/stats');
    return response.data;
  },
};
