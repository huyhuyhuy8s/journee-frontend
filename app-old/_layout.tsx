// app-old/_layout.tsx
import tamaguiConfig from "@/tamagui.config";
import { ToastProvider } from "@tamagui/toast";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalProvider, TamaguiProvider } from "tamagui";
import { ThemeContextProvider, useThemeValue } from "@/src/contexts/ThemeContext";
import { UserContextProvider } from "@/src/contexts/UserContext";
import { AppStateProvider } from "@/src/contexts/AppStateContext";
import { GlobalLoading } from "@/src/components/GlobalLoading";
import { GlobalError } from "@/src/components/GlobalError";

SplashScreen.preventAutoHideAsync();

// Create a separate component that uses the theme context
const AppContent = () => {
  const theme = useThemeValue();

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        <AppStateProvider>
          <UserContextProvider>
            <PortalProvider>
              <ToastProvider>
                <StatusBar />
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{
                      title: "Home",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="login"
                    options={{
                      title: "Login",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="register"
                    options={{
                      title: "Register",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="feed"
                    options={{
                      title: "feed",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="NewPost"
                    options={{
                      title: "feed",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="ChatScreen"
                    options={{
                      title: "ChatScreen",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="setting"
                    options={{
                      title: "setting",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="updateinfo"
                    options={{
                      title: "updateinfo",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="mywall"
                    options={{
                      title: "mywall",
                      headerShown: false,
                    }}
                  />
                </Stack>
                <GlobalLoading />
                <GlobalError />
              </ToastProvider>
            </PortalProvider>
          </UserContextProvider>
        </AppStateProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
};

export default () => {
  const renderCount = useRef(0);
  const [isReady, setIsReady] = useState(false);

  renderCount.current += 1;

  const [fontLoaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (fontLoaded && !isReady) {
      console.log(
        `🚀 App initialization complete (${renderCount.current} renders)`
      );
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, isReady]);

  // 🆕 Single loading state instead of multiple renders
  if (!isReady) {
    return null;
  }

  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
};
