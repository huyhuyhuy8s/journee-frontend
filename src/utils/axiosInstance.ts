import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import {config} from '@/config/env';
import * as SecureStore from 'expo-secure-store';
import {STORAGE_KEYS} from '@/constants/global';
import type {IResponse, IResponseError} from '@/types';

const {AUTH_TOKEN} = STORAGE_KEYS;

// Custom API client interface that returns unwrapped data
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<IResponse<T>>;

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<IResponse<T>>;

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<IResponse<T>>;

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<IResponse<T>>;

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<IResponse<T>>;
}

const axiosInstance = axios.create({
  baseURL: `${config.BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.info('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<IResponse>) => {
    console.info('Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError<IResponseError>) => {
    console.error('Response error:', error);
    if (error.response?.data) {
      const meta = error.response.data.meta;

      switch (meta.status) {
        case 401:
          console.error('Unauthorized access - logging out');
          await SecureStore.deleteItemAsync(AUTH_TOKEN);
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API error:', meta.status);
      }

      return Promise.reject({
        meta: {
          status: meta.status,
          message: meta.message || 'An error occurred',
          error: meta.error || 'Unknown error',
        },
        results: null,
      } as IResponseError);
    } else {
      console.error('Response setup error:', error);
      return Promise.reject({
        meta: {
          status: 500,
          message: 'Network error or server not responding',
          error: error.message || 'Unknown error',
        },
        results: null,
      } as IResponseError);
    }
  },
);

// Create a proxy that wraps the axios instance
const apiClient = new Proxy(axiosInstance, {
  get(target, prop: string) {
    // Override the HTTP methods to unwrap response.data
    if (prop === 'get' || prop === 'post' || prop === 'put' || prop === 'patch' || prop === 'delete') {
      return async <T = unknown>(...args: unknown[]) => {
        const response = await (target[prop as keyof AxiosInstance] as (...args: unknown[]) => Promise<AxiosResponse<IResponse<T>>>)(...args);
        return response.data;
      };
    }
    // For all other properties, return the original
    return target[prop as keyof AxiosInstance];
  },
}) as CustomAxiosInstance;

export default apiClient;
