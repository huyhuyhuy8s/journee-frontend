import { useState, useEffect } from "react";
import { BackgroundTaskService } from "@/src/components/Map/services/backgroundTaskService";
import { BACKGROUND_LOCATION_TASK } from "@/src/components/Map/utils/constants";
import * as Location from "expo-location";

export const useBackgroundTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const checkTrackingStatus = async () => {
      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
          BACKGROUND_LOCATION_TASK
        );
        setIsTracking(hasStarted);
      } catch (error) {
        console.error("❌ Error checking tracking status:", error);
      }
    };

    checkTrackingStatus();
  }, []);

  const startTracking = async (): Promise<void> => {
    const success = await BackgroundTaskService.startBackgroundTracking();
    setIsTracking(success);
  };

  const stopTracking = async (): Promise<void> => {
    await BackgroundTaskService.stopBackgroundTracking();
    setIsTracking(false);
  };

  return {
    isTracking,
    startTracking,
    stopTracking,
  };
};
