import {ConfigContext, ExpoConfig} from "@expo/config";

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  slug: "journee",
  name: "Journee",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.journeemap.journee",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.journeemap.journee",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  extra: {
    router: {},
    eas: {
      projectId: "12d64cc6-41d4-4226-849a-32080b420198",
    },
    // apiUrl:
  },
  owner: "journee-map",
});
