import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../constants/index';
import { ApiResponse } from '../../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('auth_token');
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<T>(url, config);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data: unknown, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data: unknown, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<T>(url, config);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiResponse<never> {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      console.error('API Error:', message);
      return { error: message };
    }
    console.error('Unknown error:', error);
    return { error: 'An unknown error occurred' };
  }
}

export const apiService = new ApiService();
