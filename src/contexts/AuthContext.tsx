import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {IBackendResponse, IBackendResponseError, IUser} from "@/types";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AxiosError} from "axios";
import {isUndefined} from "lodash";
import {ASYNC_STORAGE_KEYS, DEFAULT_BACKEND_RESPONSE, STORAGE_KEYS} from "@/constants/global";
import apiClient from "@/utils/apiClient";
import {ToastAndroid} from "react-native";

const {AUTH_TOKEN} = STORAGE_KEYS
const {USER_DATA: ASYNC_USER_DATA} = ASYNC_STORAGE_KEYS

interface IUserContext {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<IBackendResponse>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<IBackendResponse>;
  logout: () => Promise<IBackendResponse>;
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

    loadStoredData();
  }, []);

  const login = async (email: string, password: string): Promise<IBackendResponse> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/users/login', {email, password})
      const results = response.data.results;
      const meta = response.data.meta;

      const token = results.token;
      const user = {
        id: results.id,
        name: results.name,
        email: results.email,
        avatar: results.avatar
      };

      await SecureStore.setItemAsync(AUTH_TOKEN, token);
      await AsyncStorage.setItem(ASYNC_USER_DATA, JSON.stringify(user))

      setUser(user);
      setIsAuthenticated(true);
      return {
        status: meta.status,
        message: meta.message
      }
    } catch (error: AxiosError<IBackendResponseError> | any) {
      ToastAndroid.show(`Error when logging ${error.status}: ${error.error}, ${error.message}`, ToastAndroid.LONG);
      return error
    } finally {
      setIsLoading(false);
    }
  }

  const register = async (name: string, email: string, password: string, avatar?: string): Promise<IBackendResponse> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/users/register', {name, email, password, avatar});
      return {
        status: response.data.meta.status,
        message: response.data.meta.message
      }

    } catch (error: AxiosError | any) {
      console.error(`Error when register account ${error.status}: ${error.error}, ${error.message}`);
      return error
    } finally {
      setIsLoading(false);
    }
  }

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/users/logout')
      const meta = response.data.meta;

      await SecureStore.deleteItemAsync(AUTH_TOKEN);
      await AsyncStorage.removeItem(ASYNC_USER_DATA);
      setUser(null);
      setIsAuthenticated(false);
      return {
        status: meta.status,
        message: meta.message
      }
    } catch (error: AxiosError | any) {
      console.error(`Error when logout ${error.status}: ${error.error}, ${error.message}`);
      return error
    } finally {
      setIsLoading(false);
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (isUndefined(context)) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}