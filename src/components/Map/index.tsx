// components/Map/index.tsx
import React, {
  useEffect,
  useState,
  useRef,
  memo,
  useCallback,
  useMemo,
} from "react";
import SafeAreaVieww from "@/src/components/SafeAreaVieww";
import { useLocationPermissions } from "@/src/components/Map/hooks/useLocationPermissions";
import { useLocationTracking } from "@/src/components/Map/hooks/useLocationTracking";
import { useBackgroundTracking } from "@/src/components/Map/hooks/useBackgroundTracking";
import { useMovementState } from "@/src/components/Map/hooks/useMovementState";
import { MapViewComponent } from "@/src/components/Map/components/MapView";
import { TrackingButton } from "@/src/components/Map/components/TrackingButton";
import { MovementStateIndicator } from "@/src/components/Map/components/MovementStateIndicator";
import { LocationDisplay } from "@/src/components/Map/components/LocationDisplay";
import { AddressDisplay } from "@/src/components/Map/components/AddressDisplay";
import { ErrorMessage } from "@/src/components/Map/components/ErrorMessage";
import { VisitIndicator } from "@/src/components/Map/components/VisitIndicator";
import { BackendSyncIndicator } from "@/src/components/Map/components/BackendSyncIndicator";
import { BackendApiServices } from "@/src/services/backendApiServices";
import { useAuth } from "@/src/utils/auth";
import { router } from "expo-router";
import { Text, View } from "tamagui";
import type { Address, MapRegion } from "@/src/components/Map/utils/types";
import { NetworkDebugger } from "@/src/utils/networkDebug";

const Map: React.FC = memo(() => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // 🆕 Single render tracking with controlled logging
  const renderCount = useRef(0);
  const lastAuthState = useRef({ isAuthenticated: false, authLoading: true });
  const initFlags = useRef({
    locationInitialized: false,
    backendInitialized: false,
    authCheckCompleted: false,
  });

  renderCount.current += 1;

  // 🆕 Only log when auth state actually changes or on significant renders
  const shouldLog =
    lastAuthState.current.isAuthenticated !== isAuthenticated ||
    lastAuthState.current.authLoading !== authLoading ||
    renderCount.current <= 3;

  if (shouldLog) {
    console.log(
      `🗺️ Map render #${renderCount.current} - Auth: ${isAuthenticated}, Loading: ${authLoading}`
    );
    lastAuthState.current = { isAuthenticated, authLoading };
  }

  const { isLocationPermitted, errorMsg, requestPermissions } =
    useLocationPermissions();
  const { location, region, address, getCurrentLocation } =
    useLocationTracking();
  const { isTracking, startTracking, stopTracking } = useBackgroundTracking();
  const { getMovementStateInfo } = useMovementState();

  // 🆕 Memoize the result of getMovementStateInfo
  const movementInfo = useMemo(() => {
    return getMovementStateInfo();
  }, [getMovementStateInfo]);

  // 🆕 Memoized auth check function
  const checkAuth = useCallback(async () => {
    if (initFlags.current.authCheckCompleted || authLoading) return;

    if (!authLoading && !isAuthenticated) {
      console.log("❌ [MAP] User not authenticated, redirecting to login");
      router.replace("/login");
      return;
    }

    if (!authLoading && isAuthenticated) {
      console.log(
        "✅ [MAP] User is authenticated, proceeding with initialization"
      );
      setAuthChecked(true);
      initFlags.current.authCheckCompleted = true;
    }
  }, [isAuthenticated, authLoading]);

  // 🆕 Memoized location initialization
  const initializeLocationServices = useCallback(async () => {
    if (
      !isAuthenticated ||
      !authChecked ||
      authLoading ||
      initFlags.current.locationInitialized
    ) {
      return;
    }

    console.log("📍 [MAP] Initializing location services...");
    initFlags.current.locationInitialized = true;

    try {
      if (!isLocationPermitted) {
        const permissionGranted = await requestPermissions();
        if (permissionGranted) {
          console.log("✅ [MAP] Location permission granted");
          await getCurrentLocation();
        } else {
          console.log("❌ [MAP] Location permission denied");
        }
      } else {
        console.log("✅ [MAP] Location permission already granted");
        await getCurrentLocation();
      }
    } catch (error) {
      console.error("❌ [MAP] Error initializing location services:", error);
      initFlags.current.locationInitialized = false; // Reset on error
    } finally {
      setIsInitialized(true);
    }
  }, [
    isAuthenticated,
    authChecked,
    authLoading,
    isLocationPermitted,
    requestPermissions,
    getCurrentLocation,
  ]);

  // 🆕 Memoized backend initialization
  const initializeBackend = useCallback(async () => {
    if (
      !isAuthenticated ||
      authLoading ||
      !authChecked ||
      initFlags.current.backendInitialized
    ) {
      return;
    }

    initFlags.current.backendInitialized = true;

    try {
      console.log("🌐 [MAP] Testing backend connection...");

      // 🆕 Use simple health check since we know /api/users/validate-token works
      const isConnected = await BackendApiServices.testConnectionSimple();

      if (!isConnected) {
        console.log("🔧 [MAP] Connection failed, trying detailed test...");

        // 🆕 Fallback to detailed test
        const fallbackConnected = await BackendApiServices.testConnection();

        if (!fallbackConnected) {
          console.warn("⚠️ [MAP] Backend connection failed - offline mode");
          // You can set a state here to show offline indicator
        } else {
          console.log("✅ [MAP] Backend connected via fallback method");
        }
      } else {
        console.log("✅ [MAP] Backend connection established");
        // Since testConnectionSimple uses the auth endpoint, we know auth works
        console.log("✅ [MAP] Backend authentication confirmed");
      }
    } catch (error) {
      console.error("❌ [MAP] Error initializing backend:", error);
    }
  }, [isAuthenticated, authLoading, authChecked]);

  // 🆕 Effects with proper dependencies
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    initializeLocationServices();
  }, [initializeLocationServices]);

  useEffect(() => {
    // 🆕 Add delay to backend init to avoid render conflicts
    const timeoutId = setTimeout(initializeBackend, 100);
    return () => clearTimeout(timeoutId);
  }, [initializeBackend]);

  // 🆕 Memoize default region
  const defaultRegion = useMemo(
    () => ({
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }),
    []
  );

  const mapRegion = region || defaultRegion;

  // Early returns
  if (authLoading) {
    return (
      <SafeAreaVieww>
        <View flex={1} justify="center" items="center">
          <Text>Loading authentication...</Text>
        </View>
      </SafeAreaVieww>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!authChecked) {
    return (
      <SafeAreaVieww>
        <View flex={1} justify="center" items="center">
          <Text>Verifying authentication...</Text>
        </View>
      </SafeAreaVieww>
    );
  }

  if (!isInitialized) {
    return (
      <SafeAreaVieww>
        <View flex={1} justify="center" items="center">
          <Text>Initializing location services...</Text>
          {errorMsg && <Text color="red">{errorMsg}</Text>}
        </View>
      </SafeAreaVieww>
    );
  }

  return (
    <SafeAreaVieww>
      <MapViewComponent region={mapRegion} />
      <TrackingButton
        isTracking={isTracking}
        onStart={startTracking}
        onStop={stopTracking}
      />
      {isTracking && <MovementStateIndicator movementInfo={movementInfo} />}

      {/* 🆕 Address should now display properly */}
      <AddressDisplay address={address} />

      <LocationDisplay location={location} />
      <ErrorMessage errorMsg={errorMsg} />
      <VisitIndicator isTracking={isTracking} />
      <BackendSyncIndicator isTracking={isTracking} />
    </SafeAreaVieww>
  );
});

// 🆕 Add display name for debugging
Map.displayName = "Map";

export default Map;
