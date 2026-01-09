import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import {StatusBar} from 'expo-status-bar';
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '@/theme';
import {AuthProvider, useAuth} from '@/contexts/AuthContext';
import {useAuthMiddleware} from '@/middleware/authMiddleware';
import {LocationStateProvider} from '@/contexts/LocationStateContext';
import {RegionProvider} from '@/contexts/RegionContext';
import '@/features/map/task';

void SplashScreen.preventAutoHideAsync();

const RootLayoutNav = () => {
  useAuthMiddleware();
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{headerShown: false}}/>
      </Stack.Protected>
    </Stack>
  );
};

const RootLayout = () => {
  const [loaded] = useFonts({
    WhyteBook: require('../assets/fonts/Whyte/Whyte-Book.ttf'),
    WhyteBookItalic: require('../assets/fonts/Whyte/Whyte-BookItalic.ttf'),
    WhyteThin: require('../assets/fonts/Whyte/Whyte-Thin.ttf'),
    WhyteThinItalic: require('../assets/fonts/Whyte/Whyte-ThinItalic.ttf'),
    WhyteLight: require('../assets/fonts/Whyte/Whyte-Light.ttf'),
    WhyteLightItalic: require('../assets/fonts/Whyte/Whyte-LightItalic.ttf'),
    WhyteMedium: require('../assets/fonts/Whyte/Whyte-Medium.ttf'),
    WhyteMediumItalic: require('../assets/fonts/Whyte/Whyte-MediumItalic.ttf'),
    WhyteBold: require('../assets/fonts/Whyte/Whyte-Bold.ttf'),
    WhyteBoldItalic: require('../assets/fonts/Whyte/Whyte-BoldItalic.ttf'),
    WhyteBlack: require('../assets/fonts/Whyte/Whyte-Black.ttf'),
    WhyteBlackItalic: require('../assets/fonts/Whyte/Whyte-BlackItalic.ttf'),
    WhyteHeavy: require('../assets/fonts/Whyte/Whyte-Heavy.ttf'),
    WhyteHeavyItalic: require('../assets/fonts/Whyte/Whyte-HeavyItalic.ttf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PPNeueMontrealThin: require('../assets/fonts/PPNeueMontreal/PPNeueMontrealMono-Thin.ttf'),
    PPNeueMontrealRegular: require('../assets/fonts/PPNeueMontreal/PPNeueMontrealMono-Regular.ttf'),
    PPNeueMontrealRegularItalic: require('../assets/fonts/PPNeueMontreal/PPNeueMontrealMono-RegularItalic.ttf'),
    PPNeueMontrealMedium: require('../assets/fonts/PPNeueMontreal/PPNeueMontrealMono-Medium.ttf'),
    PPNeueMontrealBold: require('../assets/fonts/PPNeueMontreal/PPNeueMontrealMono-Bold.ttf'),
    PPNeueMontrealBoldItalic: require('../assets/fonts/PPNeueMontreal/PPNeueMontrealMono-BoldItalic.ttf'),
    IvyOraTextThin: require('../assets/fonts/IvyOraText/IvyOraText-Thin.ttf'),
    IvyOraTextThinItalic: require('../assets/fonts/IvyOraText/IvyOraText-ThinItalic.ttf'),
    IvyOraTextLight: require('../assets/fonts/IvyOraText/IvyOraText-Light.ttf'),
    IvyOraTextLightItalic: require('../assets/fonts/IvyOraText/IvyOraText-LightItalic.ttf'),
    IvyOraTextRegular: require('../assets/fonts/IvyOraText/IvyOraText-Regular.ttf'),
    IvyOraTextRegularItalic: require('../assets/fonts/IvyOraText/IvyOraText-RegularItalic.ttf'),
    IvyOraTextMedium: require('../assets/fonts/IvyOraText/IvyOraText-Medium.ttf'),
    IvyOraTextMediumItalic: require('../assets/fonts/IvyOraText/IvyOraText-MediumItalic.ttf'),
    IvyOraTextBold: require('../assets/fonts/IvyOraText/IvyOraText-Bold.ttf'),
    IvyOraTextBoldItalic: require('../assets/fonts/IvyOraText/IvyOraText-BoldItalic.ttf'),
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
              <StatusBar style="auto" animated/>
              <RootLayoutNav/>
            </SafeAreaProvider>
          </RegionProvider>
        </LocationStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
