/**
 * Environment Configuration for React Native
 * 
 * In Expo/React Native, environment variables are accessed via process.env
 * Variables must be prefixed with EXPO_PUBLIC_ to be available in the app
 * 
 * Add your environment variables to .env file in the root directory:
 * EXPO_PUBLIC_API_URL=https://your-api-url.com
 */

interface EnvConfig {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;
  SOCKET_URL: string;
  BACKEND_URL: string;
  API_URL: string;
  GOOGLE_MAPS_API_KEY: string;
  OPEN_MAPS_API_KEY: string;
  EAS_PROJECT_ID: string;
  NODE_ENV: string;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key];
  
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set and no default provided`);
    return '';
  }

  return value || defaultValue;
}

export const config: EnvConfig = {
  NODE_ENV: getEnvVar("NODE_ENV", 'development'),
  FIREBASE_API_KEY: getEnvVar("EXPO_PUBLIC_FIREBASE_API_KEY", ''),
  FIREBASE_AUTH_DOMAIN: getEnvVar("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", ''),
  FIREBASE_PROJECT_ID: getEnvVar("EXPO_PUBLIC_FIREBASE_PROJECT_ID", ''),
  FIREBASE_STORAGE_BUCKET: getEnvVar("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET", ''),
  FIREBASE_MESSAGING_SENDER_ID: getEnvVar("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", ''),
  FIREBASE_APP_ID: getEnvVar("EXPO_PUBLIC_FIREBASE_APP_ID", ''),
  FIREBASE_MEASUREMENT_ID: getEnvVar("EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID", ''),
  SOCKET_URL: getEnvVar("EXPO_PUBLIC_SOCKET_URL", ''),
  BACKEND_URL: getEnvVar("EXPO_PUBLIC_BACKEND_URL", 'https://journee-1gt3.onrender.com'),
  API_URL: getEnvVar("EXPO_PUBLIC_API_URL", 'https://journee-1gt3.onrender.com'),
  GOOGLE_MAPS_API_KEY: getEnvVar("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY", ''),
  OPEN_MAPS_API_KEY: getEnvVar("EXPO_PUBLIC_OPEN_MAPS_API_KEY", ''),
  EAS_PROJECT_ID: getEnvVar("EXPO_PUBLIC_EAS_PROJECT_ID", ''),
}