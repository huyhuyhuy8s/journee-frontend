import {createContext, ReactNode, useContext, useState} from "react";
import {IUser} from "@/types";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import {isUndefined} from "lodash";
import {config} from "@/config/env";

interface IUserContext {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<IUserContext>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {
  },
  register: async () => {
  },
  logout: async () => {
  }
});

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = (props: IAuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const BACKEND_URL = config.BACKEND_URL;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users/login`, {email, password});
      const results = response.data.results;

      const token = results.token;
      const user = {
        id: results.id,
        name: results.name,
        email: results.email,
        // avatar: results.avatar
      };

      console.log('Token', token);
      console.log('User', user);

      await SecureStore.setItemAsync('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user))

      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const register = async (name: string, email: string, password: string, avatar?: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users/register`, {name, email, password, avatar});
      const results = response.data.results;

      const token = results.token;
      const user = {
        id: results.id,
        name: results.name,
        email: results.email,
        avatar: results.avatars
      }

      await SecureStore.setItemAsync('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user))

      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const logout = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      console.log('Token', token);
      const response = await axios.post(`${BACKEND_URL}/api/users/logout`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const {message} = response.data;

      if (message) console.log(message);

      await SecureStore.deleteItemAsync('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error(error);
      throw error;
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