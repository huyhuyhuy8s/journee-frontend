import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

export const getAuthToken = async (): Promise<string | null> => {
  try {
    // Try SecureStore first
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (token) return token;

    // Fallback to AsyncStorage
    const fallbackToken = await AsyncStorage.getItem('authToken');
    return fallbackToken;
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
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('backgroundAuthToken');
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return {valid: false, message: 'Password must be at least 6 characters long'};
  }
  return {valid: true};
};

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (username.length < 3) {
    return {valid: false, message: 'Username must be at least 3 characters long'};
  }
  return {valid: true};
};
