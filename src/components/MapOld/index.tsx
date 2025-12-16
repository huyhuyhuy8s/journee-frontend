import React, {memo, useCallback, useEffect, useMemo, useRef, useState,} from "react";
import {useLocationPermissions} from "@/components/MapOld/hooks/useLocationPermissions";
import {useBackgroundTracking} from "@/components/MapOld/hooks/useBackgroundTracking";
import {useLocationTracking} from "@/components/MapOld/hooks/useLocationTracking";
import {useMovementState} from "@/components/MapOld/hooks/useMovementState";
import {MovementStateIndicator} from "@/components/MapOld/components/MovementStateIndicator";
import {MapViewComponent} from "@/components/MapOld/components/MapView";
import {TrackingButton} from "@/components/MapOld/components/TrackingButton";
import {AddressDisplay} from "@/components/MapOld/components/AddressDisplay";
import {LocationDisplay} from "@/components/MapOld/components/LocationDisplay";
import {ErrorMessage} from "@/components/MapOld/components/ErrorMessage";
import {BackendSyncIndicator} from "@/components/MapOld/components/BackendSyncIndicator";
import {VisitIndicator} from "@/components/MapOld/components/VisitIndicator";

const MapComponent: React.FC = memo(() => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const renderCount = useRef(0);
  const initFlags = useRef({
    locationInitialized: false,
    backendInitialized: false,
    authCheckCompleted: false,
  });

  renderCount.current += 1;

  const {isLocationPermitted, errorMsg, requestPermissions} =
    useLocationPermissions();
  const {location, region, address, getCurrentLocation} =
    useLocationTracking();
  const {isTracking, startTracking, stopTracking} = useBackgroundTracking();
  const {getMovementStateInfo} = useMovementState();

  const movementInfo = useMemo(() => {
    return getMovementStateInfo();
  }, [getMovementStateInfo]);


  const initializeLocationServices = useCallback(async () => {
    if (
      !authChecked ||
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
    authChecked,
    isLocationPermitted,
    requestPermissions,
    getCurrentLocation,
  ]);

  useEffect(() => {
    initializeLocationServices();
  }, [initializeLocationServices]);

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

  return (
    <>
      <MapViewComponent region={mapRegion}/>
      <TrackingButton
        isTracking={isTracking}
        onStart={startTracking}
        onStop={stopTracking}
      />
      {isTracking && <MovementStateIndicator movementInfo={movementInfo}/>}

      <AddressDisplay address={address}/>

      <LocationDisplay location={location}/>
      <ErrorMessage errorMsg={errorMsg}/>
      <VisitIndicator isTracking={isTracking}/>
      <BackendSyncIndicator isTracking={isTracking}/>
    </>
  );
});

MapComponent.displayName = "Map";

export default MapComponent;
