import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import {StatusBar} from "expo-status-bar";
import {initialWindowMetrics, SafeAreaProvider} from "react-native-safe-area-context";
import {ThemeProvider} from "@/theme";
import {AuthProvider, useAuth} from "@/contexts/AuthContext";
import {useAuthMiddleware} from "@/middleware/authMiddleware";

SplashScreen.preventAutoHideAsync();

const RootLayoutNav = () => {
  useAuthMiddleware();
  const {isAuthenticated} = useAuth()

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="users/[userId]" options={{headerShown: false}}/>
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" options={{headerShown: false}}/>
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="register" options={{headerShown: false}}/>
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
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <StatusBar style="auto" animated/>
          <RootLayoutNav/>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default RootLayout;