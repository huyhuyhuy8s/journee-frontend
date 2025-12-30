import axios, {AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {config} from "@/config/env";
import * as SecureStore from 'expo-secure-store';
import {STORAGE_KEYS} from '@/constants/global';
import {IBackendResponseError} from "@/types";

const {AUTH_TOKEN} = STORAGE_KEYS

const apiClient: AxiosInstance = axios.create({
  baseURL: `${config.BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError<IBackendResponseError>) => {
    if (error.response) {
      const {status} = error.response;

      switch (status) {
        case 401:
          await SecureStore.deleteItemAsync(AUTH_TOKEN);
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API error:', status);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }

    const response = error.response;
    if (!response) return Promise.reject(error);

    return Promise.reject({
      status: response.status,
      message: response.data.meta.message,
      error: response.data.meta.error,
    });
  }
);

export default apiClient;