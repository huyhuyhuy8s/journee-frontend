import {ASYNC_STORAGE_KEYS, FOREGROUND_INTERVAL} from '@/constants';
import {useLocationState} from '@/contexts/LocationStateContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';

const {CURRENT_LOCATION} = ASYNC_STORAGE_KEYS;

interface ICurrentLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface IForegroundControllerHook {
  isForegroundStarted: boolean;
  currentLocation: ICurrentLocation | null;
  updateCount: number;
  hasForegroundPermission: boolean;
  timeSinceUpdate: string;
  handleToggleTracking: () => Promise<void>;
}

export const useForegroundController = (): IForegroundControllerHook => {
  const {
    isForegroundStarted,
    startForegroundTracking,
    stopForegroundTracking,
    statusForegroundPermission,
  } = useLocationState();

  const [currentLocation, setCurrentLocation] = useState<ICurrentLocation | null>(null);
  const [updateCount, setUpdateCount] = useState<number>(0);

  useEffect(() => {
    const pollLocation = async () => {
      const locationJson = await AsyncStorage.getItem(CURRENT_LOCATION);
      if (locationJson) {
        try {
          const location = JSON.parse(locationJson);
          setCurrentLocation(location);
          setUpdateCount((prev) => prev + 1);
        } catch (error) {
          console.error('❌ Error parsing location from AsyncStorage:', error);
        }
      }
    };

    if (isForegroundStarted) {
      void pollLocation();

      const interval = setInterval(pollLocation, FOREGROUND_INTERVAL.TIME);
      return () => clearInterval(interval);
    }
  }, [isForegroundStarted]);

  const handleToggleTracking = async (): Promise<void> => {
    if (isForegroundStarted) {
      await stopForegroundTracking();
      // Reset state when stopping
      setCurrentLocation(null);
      setUpdateCount(0);
    } else {
      await startForegroundTracking();
    }
  };

  const getTimeSinceUpdate = (): string => {
    if (!currentLocation) return '-';

    const seconds = Math.floor((Date.now() - currentLocation.timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return {
    isForegroundStarted,
    currentLocation,
    updateCount,
    hasForegroundPermission: statusForegroundPermission?.granted ?? false,
    timeSinceUpdate: getTimeSinceUpdate(),
    handleToggleTracking,
  };
};
