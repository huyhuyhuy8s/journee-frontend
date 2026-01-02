import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import type {IResponse, IResponseError, IUser} from '@/types';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isUndefined} from 'lodash';
import {ASYNC_STORAGE_KEYS, DEFAULT_BACKEND_RESPONSE, STORAGE_KEYS} from '@/constants/global';
import apiClient from '@/utils/axiosInstance';
import {ToastAndroid} from 'react-native';

const {AUTH_TOKEN} = STORAGE_KEYS;
const {USER_DATA: ASYNC_USER_DATA} = ASYNC_STORAGE_KEYS;

interface IUserContext {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<IResponse | IResponseError>;
  register: (
    name: string,
    email: string,
    password: string,
    avatar?: string,
  ) => Promise<IResponse | IResponseError>;
  logout: () => Promise<IResponse | IResponseError>;
}

const AuthContext = createContext<IUserContext>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => DEFAULT_BACKEND_RESPONSE,
  register: async () => DEFAULT_BACKEND_RESPONSE,
  logout: async () => DEFAULT_BACKEND_RESPONSE,
});

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = (props: IAuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN);
        const userData = await AsyncStorage.getItem(ASYNC_USER_DATA);

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load auth data from storage', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData().then();
  }, []);

  const login = async (email: string, password: string): Promise<IResponse | IResponseError> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<IUser>('/users/login', {
        email,
        password,
      });
      const results = response.results;

      const token = results.token;
      const user = {
        id: results.id,
        name: results.name,
        email: results.email,
        avatar: results.avatar,
      };

      if (token) await SecureStore.setItemAsync(AUTH_TOKEN, token);
      await AsyncStorage.setItem(ASYNC_USER_DATA, JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      return response;
    } catch (error: unknown) {
      const err = (error as IResponseError);
      ToastAndroid.show(
        `Error when logging ${err.meta.status} ${err.meta.error}: ${err.meta.message}`,
        ToastAndroid.LONG,
      );
      return err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    avatar?: string,
  ): Promise<IResponse | IResponseError> => {
    setIsLoading(true);
    try {
      return await apiClient.post('/users/register', {
        name,
        email,
        password,
        avatar,
      });
    } catch (error: unknown) {
      const err = (error as IResponseError).meta;
      console.error(
        `Error when register account ${err.status}: ${err.error}, ${err.message}`,
      );
      return error as IResponseError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<IResponse | IResponseError> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/users/logout');
      await SecureStore.deleteItemAsync(AUTH_TOKEN);
      await AsyncStorage.removeItem(ASYNC_USER_DATA);
      setUser(null);
      setIsAuthenticated(false);
      return response;
    } catch (error: unknown) {
      const err = (error as IResponseError);
      console.error(
        `Error when logout ${err.meta.status}: ${err.meta.error}, ${err.meta.message}`,
      );
      return err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (isUndefined(context)) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
