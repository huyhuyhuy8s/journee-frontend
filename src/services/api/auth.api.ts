import apiClient from '@/utils/apiClient';
import * as SecureStore from 'expo-secure-store';
import {STORAGE_KEYS} from '@/constants';

const {AUTH_TOKEN} = STORAGE_KEYS;

interface IApiResponse<T> {
  meta: {
    status: number;
    message: string;
    error?: string;
  };
  results?: T;
}

interface ILoginResponse {
  id: string;
  email: string;
  name: string;
  avatar: string;
  token: string;
}

interface IRegisterResponse {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

interface IUserResponse {
  id: string;
  email: string;
  name: string;
  avatar: string;
  message?: string;
}

export class AuthApiService {
  private static instance: AuthApiService;

  private constructor() {
  }

  static getInstance = (): AuthApiService => {
    if (!AuthApiService.instance) {
      AuthApiService.instance = new AuthApiService();
    }
    return AuthApiService.instance;
  };

  login = async (email: string, password: string): Promise<ILoginResponse> => {
    const response = await apiClient.post<IApiResponse<ILoginResponse>>(
      '/users/login',
      {email, password}
    );

    const userData = response.data.results!;

    await SecureStore.setItemAsync(AUTH_TOKEN, userData.token);

    return userData;
  };

  register = async (
    name: string,
    email: string,
    password: string,
    avatar?: string
  ): Promise<IRegisterResponse> => {
    const response = await apiClient.post<IApiResponse<IRegisterResponse>>(
      '/users/register',
      {name, email, password, avatar}
    );

    return response.data.results!;
  };

  logout = async (): Promise<void> => {
    try {
      await apiClient.post('/users/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await SecureStore.deleteItemAsync(AUTH_TOKEN);
    }
  };

  getCurrentUser = async (): Promise<IUserResponse> => {
    const response = await apiClient.get<IApiResponse<IUserResponse>>(
      '/users/me'
    );
    return response.data.results!;
  };

  validateToken = async (): Promise<IUserResponse> => {
    const response = await apiClient.get<IApiResponse<IUserResponse>>(
      '/users/validate-token'
    );
    return response.data.results!;
  };

  updateUser = async (
    userId: string,
    updates: {
      name?: string;
      email?: string;
      avatar?: string;
    }
  ): Promise<void> => {
    await apiClient.put(`/users/${userId}`, updates);
  };

  deleteUser = async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
    await SecureStore.deleteItemAsync(AUTH_TOKEN);
  };

  getAllUsers = async (): Promise<IUserResponse[]> => {
    const response = await apiClient.get<IApiResponse<{ users: IUserResponse[] }>>(
      '/users/all'
    );
    return response.data.results!.users;
  };

  getUserById = async (userId: string): Promise<IUserResponse> => {
    const response = await apiClient.get<IApiResponse<IUserResponse>>(
      `/users/${userId}`
    );
    return response.data.results!;
  };
}

export default AuthApiService.getInstance();