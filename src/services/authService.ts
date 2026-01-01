import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AxiosError} from "axios";
import apiClient from "@/utils/apiClient";
import {ASYNC_STORAGE_KEYS, DEFAULT_BACKEND_RESPONSE, STORAGE_KEYS,} from "@/constants/global";
import {IResponse, IResponseError, IUser} from "@/types";

const {AUTH_TOKEN} = STORAGE_KEYS;
const {USER_DATA: ASYNC_USER_DATA} = ASYNC_STORAGE_KEYS;

export const loadStoredAuth = async (): Promise<{
  user: IUser | null;
  isAuthenticated: boolean;
}> => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN);
  const userData = await AsyncStorage.getItem(ASYNC_USER_DATA);

  if (token && userData) {
    return {
      user: JSON.parse(userData),
      isAuthenticated: true,
    };
  }

  return {user: null, isAuthenticated: false};
}

export const loginService = async (
  email: string,
  password: string,
): Promise<{ response: IResponse; user: IUser | null }> => {
  try {
    const res = await apiClient.post("/users/login", {email, password});
    const results = res.data.results;
    const meta = res.data.meta;

    const token = results.token;
    const user: IUser = {
      id: results.id,
      name: results.name,
      email: results.email,
      avatar: results.avatar,
    };

    await SecureStore.setItemAsync(AUTH_TOKEN, token);
    await AsyncStorage.setItem(ASYNC_USER_DATA, JSON.stringify(user));

    return {
      response: {status: meta.status, message: meta.message},
      user,
    };
  } catch (error: AxiosError<IResponseError> | any) {
    return {
      response:
        error?.response?.data ??
        DEFAULT_BACKEND_RESPONSE, // or map error shape as you like
      user: null,
    };
  }
}

export const registerService = async (
  name: string,
  email: string,
  password: string,
  avatar?: string,
): Promise<IResponse> => {
  try {
    const res = await apiClient.post("/users/register", {
      name,
      email,
      password,
      avatar,
    });
    return {
      status: res.data.meta.status,
      message: res.data.meta.message,
    };
  } catch (error: AxiosError | any) {
    return (
      error?.response?.data ?? DEFAULT_BACKEND_RESPONSE
    );
  }
}

export const logoutService = async (): Promise<IResponse> => {
  try {
    const res = await apiClient.post("/users/logout");
    const meta = res.data.meta;

    await SecureStore.deleteItemAsync(AUTH_TOKEN);
    await AsyncStorage.removeItem(ASYNC_USER_DATA);

    return {status: meta.status, message: meta.message};
  } catch (error: AxiosError | any) {
    return (
      error?.response?.data ?? DEFAULT_BACKEND_RESPONSE
    );
  }
}
