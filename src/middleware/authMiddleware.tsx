import {useEffect} from 'react';
import {useRouter, useSegments} from 'expo-router';
import {useAuth} from '@/contexts/AuthContext';

/**
 * Auth middleware hook that protects routes
 * Place this in the root layout to handle authentication routing
 */
export function useAuthMiddleware() {
  const {isAuthenticated, isLoading} = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if trying to access protected routes
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      // Redirect to main app if already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router]);
}
