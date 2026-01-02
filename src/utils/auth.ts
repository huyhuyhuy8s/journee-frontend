import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ASYNC_STORAGE_KEYS, STORAGE_KEYS } from '@/constants/global';

const { AUTH_TOKEN } = STORAGE_KEYS;
const { USER_DATA: ASYNC_USER_DATA } = ASYNC_STORAGE_KEYS;

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(ASYNC_USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN);
    await AsyncStorage.removeItem(ASYNC_USER_DATA);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return {
      valid: false,
      message: 'Password must be at least 6 characters long',
    };
  }
  return { valid: true };
};

export const validateUsername = (
  username: string
): { valid: boolean; message?: string } => {
  if (username.length < 3) {
    return {
      valid: false,
      message: 'Username must be at least 3 characters long',
    };
  }
  return { valid: true };
};
