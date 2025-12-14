import axios, { AxiosError } from "axios";
import {
  API_FETCH_ALL_USERS,
  API_FETCH_USER,
  API_LOGIN,
  API_REGISTER,
} from "@/src/api/apiRoutes";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

// ✅ Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development" || __DEV__;

// ✅ Logger utility that only logs in development
const devLog = {
  log: (...args: any[]) => isDevelopment && console.log(...args),
  error: (...args: any[]) => isDevelopment && console.error(...args),
  warn: (...args: any[]) => isDevelopment && console.warn(...args),
};

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

// ✅ Enhanced request interceptor with conditional logging
apiClient.interceptors.request.use(
  (config) => {
    if (isDevelopment) {
      const timestamp = new Date().toISOString();
      const method = config.method?.toUpperCase();
      const url = `${config.baseURL}${config.url}`;

      // Log request details
      devLog.log(`📤 [REQUEST] ${timestamp}`);
      devLog.log(`   Method: ${method}`);
      devLog.log(`   URL: ${url}`);
      devLog.log(`   Headers:`, config.headers);

      // Log request body (exclude sensitive data)
      if (config.data) {
        const logData = { ...config.data };
        if (logData.password) logData.password = "***HIDDEN***";
        devLog.log(`   Body:`, logData);
      }
    }

    // Always add metadata for timing (minimal performance impact)
    config.metadata = {
      startTime: Date.now(),
      timestamp: new Date().toISOString(),
    };

    return config;
  },
  (error) => {
    devLog.error("❌ [REQUEST ERROR]:", error);
    return Promise.reject(error);
  }
);

// ✅ Enhanced response interceptor with conditional logging
apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      const endTime = Date.now();
      const startTime = response.config.metadata?.startTime || endTime;
      const duration = endTime - startTime;
      const timestamp = new Date().toISOString();

      devLog.log(`📥 [RESPONSE] ${timestamp}`);
      devLog.log(`   Status: ${response.status} ${response.statusText}`);
      devLog.log(`   URL: ${response.config.url}`);
      devLog.log(`   Duration: ${duration}ms`);
      devLog.log(
        `   Response Size: ${JSON.stringify(response.data).length} bytes`
      );

      // Log response data (limit size for readability)
      const responseDataString = JSON.stringify(response.data);
      if (responseDataString.length > 1000) {
        devLog.log(
          `   Response: ${responseDataString.substring(0, 1000)}... (truncated)`
        );
      } else {
        devLog.log(`   Response:`, response.data);
      }
    }

    return response;
  },
  (error: AxiosError) => {
    if (isDevelopment) {
      const timestamp = new Date().toISOString();
      const duration = error.config?.metadata
        ? Date.now() - error.config.metadata.startTime
        : 0;

      devLog.error(`❌ [RESPONSE ERROR] ${timestamp}`);
      devLog.error(`   Status: ${error.response?.status || "Network Error"}`);
      devLog.error(`   URL: ${error.config?.url || "Unknown"}`);
      devLog.error(`   Duration: ${duration}ms`);
      devLog.error(`   Error:`, error.response?.data || error.message);
    }

    // Handle unauthorized access (always run this logic)
    if (error.response?.status === 401) {
      devLog.warn("🔐 [AUTH] Unauthorized access - clearing token");
      setAuthToken(null);
      // You can add navigation logic here
    }

    return Promise.reject(error);
  }
);

// ✅ Enhanced API functions with conditional logging
export const authAPI = {
  login: async (email: string, password: string) => {
    devLog.log("🔐 [AUTH] Attempting login for:", email);
    try {
      const response = await apiClient.post(API_LOGIN, { email, password });
      devLog.log("✅ [AUTH] Login successful for:", email);
      return response;
    } catch (error) {
      devLog.error("❌ [AUTH] Login failed for:", email);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    devLog.log("👤 [AUTH] Attempting registration for:", email);
    try {
      const response = await apiClient.post(API_REGISTER, {
        name,
        email,
        password,
      });
      devLog.log("✅ [AUTH] Registration successful for:", email);
      return response;
    } catch (error) {
      devLog.error("❌ [AUTH] Registration failed for:", email);
      throw error;
    }
  },

  logout: async () => {
    devLog.log("🚪 [AUTH] Logging out user");
    try {
      const response = await apiClient.post("/api/users/logout");
      devLog.log("✅ [AUTH] Logout successful");
      return response;
    } catch (error) {
      devLog.error("❌ [AUTH] Logout failed");
      throw error;
    }
  },

  validateToken: async () => {
    devLog.log("🔍 [AUTH] Validating token");
    try {
      const response = await apiClient.get("/api/users/validate-token");
      devLog.log("✅ [AUTH] Token validation successful");
      return response;
    } catch (error) {
      devLog.error("❌ [AUTH] Token validation failed");
      throw error;
    }
  },

  getProfile: async () => {
    devLog.log("👤 [USER] Fetching user profile");
    try {
      const response = await apiClient.get("/api/users/profile");
      devLog.log("✅ [USER] Profile fetched successfully");
      return response;
    } catch (error) {
      devLog.error("❌ [USER] Failed to fetch profile");
      throw error;
    }
  },

  updateProfile: async (data: { name?: string; avatar?: string }) => {
    devLog.log("✏️ [USER] Updating profile:", Object.keys(data));
    try {
      const response = await apiClient.put("/api/users/profile", data);
      devLog.log("✅ [USER] Profile updated successfully");
      return response;
    } catch (error) {
      devLog.error("❌ [USER] Failed to update profile");
      throw error;
    }
  },

  getAllUsers: async () => {
    devLog.log("👥 [USER] Fetching all users");
    try {
      const response = await apiClient.get(API_FETCH_ALL_USERS);
      devLog.log(`✅ [USER] Fetched ${response.data?.length || 0} users`);
      return response;
    } catch (error) {
      devLog.error("❌ [USER] Failed to fetch users");
      throw error;
    }
  },

  getUserById: async (id: string) => {
    devLog.log("👤 [USER] Fetching user by ID:", id);
    try {
      const response = await apiClient.get(API_FETCH_USER.replace(":id", id));
      devLog.log(
        "✅ [USER] User fetched successfully:",
        response.data?.name || "Unknown"
      );
      return response;
    } catch (error) {
      devLog.error("❌ [USER] Failed to fetch user:", id);
      throw error;
    }
  },
};

// ✅ Type declaration for axios config metadata
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
      timestamp: string;
    };
  }
}
