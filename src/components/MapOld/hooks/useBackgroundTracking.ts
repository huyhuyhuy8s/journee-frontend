import {useEffect, useState} from "react";
import * as Location from "expo-location";
import {BACKGROUND_LOCATION_TASK} from "@/components/Map/utils/constants";
import {BackgroundTaskService} from "@/components/Map/services/backgroundTaskService";

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
