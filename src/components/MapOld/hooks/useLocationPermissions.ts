import {useState} from "react";
import * as Location from "expo-location";
import {LocationService} from "@/components/Map/services/locationService";

export const useLocationPermissions = () => {
  const [foregroundPermission, setForegroundPermission] =
    useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
  const [backgroundPermission, setBackgroundPermission] =
    useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
  const [isLocationPermitted, setIsLocationPermitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const foregroundStatus =
        await LocationService.requestForegroundPermissions();
      setForegroundPermission(foregroundStatus);

      if (foregroundStatus !== Location.PermissionStatus.GRANTED) {
        setErrorMsg("Foreground permission denied");
        return false;
      }

      setIsLocationPermitted(true);

      const backgroundStatus =
        await LocationService.requestBackgroundPermissions();
      setBackgroundPermission(backgroundStatus);

      if (backgroundStatus !== Location.PermissionStatus.GRANTED) {
        setErrorMsg("Background permission denied");
      }

      return true;
    } catch (error) {
      console.error("❌ Error requesting permissions:", error);
      setErrorMsg("Permission request failed");
      return false;
    }
  };

  return {
    foregroundPermission,
    backgroundPermission,
    isLocationPermitted,
    errorMsg,
    requestPermissions,
    setErrorMsg,
  };
};
