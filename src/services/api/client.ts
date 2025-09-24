import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from './types';

// Constants
const TOKEN_KEY = 'auth_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/${import.meta.env.VITE_API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management functions
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    const apiResponse = response.data as ApiResponse;
    // Accept both { success: true } and { status: 'success' }
    const isSuccess = apiResponse?.success === true || apiResponse?.status === 'success' || (typeof apiResponse?.status === 'number' && apiResponse.status >= 200 && apiResponse.status < 300);
    if (!isSuccess) {
      throw new ApiError(
        apiResponse?.error?.code || 'UNKNOWN_ERROR',
        response.status,
        apiResponse?.message || 'Request failed',
        apiResponse?.error?.details
      );
    }
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const apiResponse = error.response.data;
      
      // Handle 401 - Unauthorized
      if (error.response.status === 401) {
        removeToken();
        // Don't redirect here - let the app handle it
      }
      
      throw new ApiError(
        apiResponse?.error?.code || 'UNKNOWN_ERROR',
        error.response.status,
        apiResponse?.message || error.message,
        apiResponse?.error?.details
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new ApiError(
        'NETWORK_ERROR',
        0,
        'Network error. Please check your connection.',
        error.message
      );
    } else {
      // Something else happened
      throw new ApiError(
        'REQUEST_ERROR',
        0,
        'An error occurred while making the request.',
        error.message
      );
    }
  }
);

// Generic request functions
export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data!;
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data!;
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data!;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data!;
  },

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data!;
  },
};

export default apiClient;