import {EUserLocationState} from '@/constants';
import {useLocationState} from '@/contexts/LocationStateContext';
import journalService from '@/services/journalService';
import {useTheme} from '@/theme';
import {formatInterval} from '@/utils/location';
import {useEffect, useState} from 'react';
import type {ColorValue} from 'react-native';

interface IBackgroundControllerHook {
  isBackgroundStarted: boolean;
  currentState: EUserLocationState;
  currentInterval: number;
  unsyncedCount: number;
  hasBackgroundPermission: boolean;
  formattedInterval: string;
  handleToggleTracking: () => Promise<void>;
  getStateColor: (state: EUserLocationState) => ColorValue;
}

export const useBackgroundController = (): IBackgroundControllerHook => {
  const {
    isBackgroundStarted,
    startBackgroundTracking,
    stopBackgroundTracking,
    currentState,
    currentInterval,
    statusBackgroundPermission,
  } = useLocationState();
  const {colors} = useTheme();

  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);

  useEffect(() => {
    const updateUnsyncedCount = async () => {
      const count = await journalService.getUnsyncedCount();
      setUnsyncedCount(count);
    };

    void updateUnsyncedCount();

    const interval = setInterval(updateUnsyncedCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTracking = async (): Promise<void> => {
    if (isBackgroundStarted) {
      await stopBackgroundTracking();
    } else {
      await startBackgroundTracking();
    }
  };

  const getStateColor = (state: EUserLocationState): ColorValue => {
    switch (state) {
      case EUserLocationState.FAST_MOVING:
        return colors.orange;
      case EUserLocationState.SLOW_MOVING:
        return colors.yellow;
      case EUserLocationState.STATIONARY:
        return colors.green400;
      default:
        return colors.green;
    }
  };

  return {
    isBackgroundStarted,
    currentState,
    currentInterval,
    unsyncedCount,
    hasBackgroundPermission: statusBackgroundPermission?.granted ?? false,
    formattedInterval: formatInterval(currentInterval),
    handleToggleTracking,
    getStateColor,
  };
};
