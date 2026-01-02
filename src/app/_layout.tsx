import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useAuthMiddleware } from '@/middleware/authMiddleware';
import { LocationStateProvider } from '@/contexts/LocationStateContext';
import { RegionProvider } from '@/contexts/RegionContext';

SplashScreen.preventAutoHideAsync().then();

const RootLayoutNav = () => {
  useAuthMiddleware();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};

const RootLayout = () => {
  const [loaded] = useFonts({
    Whyte: require('../assets/fonts/Whyte-Book.ttf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationStateProvider>
          <RegionProvider>
            <SafeAreaProvider initialMetrics={initialWindowMetrics}>
              <StatusBar style="auto" animated />
              <RootLayoutNav />
            </SafeAreaProvider>
          </RegionProvider>
        </LocationStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
