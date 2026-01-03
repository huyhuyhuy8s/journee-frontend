import React, {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, type AppStateStatus} from 'react-native';
import userLocationStateService from '@/services/userLocationStateService';
import {ASYNC_STORAGE_KEYS, EUserLocationState, STATE_INTERVALS} from '@/constants';
import {BACKGROUND_LOCATION_TASK, FOREGROUND_LOCATION_TASK} from '@/features/map/task';
import {type ICoordinate, type ILocation} from '@/types';

const {LOCATION_STATE_CHANGED, LOCATION_DATA, LAST_FOREGROUND_PROCESS} = ASYNC_STORAGE_KEYS;

interface ILocationStateContext {
  location: ILocation;
  setLocation: React.Dispatch<React.SetStateAction<ILocation>>;
  isBackgroundStarted: boolean;
  startBackgroundTracking: () => Promise<void>;
  stopBackgroundTracking: () => Promise<void>;
  isForegroundStarted: boolean;
  startForegroundTracking: () => Promise<void>;
  stopForegroundTracking: () => Promise<void>;
  currentState: EUserLocationState;
  currentInterval: number;
  hasLocationPermission: boolean;
  hasBackgroundPermission: boolean;
  requestPermissions: () => Promise<boolean>;
}

const LocationStateContext = createContext<ILocationStateContext | undefined>(
  undefined,
);

export const useLocationState = (): ILocationStateContext => {
  const context = useContext(LocationStateContext);
  if (!context) {
    throw new Error(
      'useLocationState must be used within LocationStateProvider',
    );
  }
  return context;
};

interface ILocationStateProviderProps {
  children: ReactNode;
}

export const LocationStateProvider: React.FC<ILocationStateProviderProps> = ({
  children,
}) => {
  const [location, setLocation] = useState<ILocation>({
    coordinate: {
      latitude: 0,
      longitude: 0,
    },
  });
  const [isBackgroundStarted, setIsBackgroundStarted] =
    useState<boolean>(false);
  const [isForegroundStarted, setIsForegroundStarted] =
    useState<boolean>(false);
  const [currentState, setCurrentState] = useState<EUserLocationState>(
    EUserLocationState.FAST_MOVING,
  );
  const [currentInterval, setCurrentInterval] = useState<number>(
    STATE_INTERVALS[EUserLocationState.FAST_MOVING],
  );
  const [hasLocationPermission, setHasLocationPermission] =
    useState<boolean>(false);
  const [hasBackgroundPermission, setHasBackgroundPermission] =
    useState<boolean>(false);

  const loadCurrentState = async (): Promise<void> => {
    const state = await userLocationStateService.getCurrentState();
    setCurrentState(state);
    setCurrentInterval(STATE_INTERVALS[state]);
  };

  const startBackgroundTracking = useCallback(async (): Promise<void> => {
    try {
      if (!hasBackgroundPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      // Check if task is already running
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK,
      );

      if (isRegistered) {
        console.info('ℹ️ Background task already running');
        setIsBackgroundStarted(true);
        return;
      }

      // Verify task is defined
      const taskDefined = TaskManager.isTaskDefined(
        BACKGROUND_LOCATION_TASK,
      );

      if (!taskDefined) {
        console.error('❌ Background location task is not defined');
        throw new Error('Background location task is not defined. Please restart the app.');
      }

      const interval = await userLocationStateService.getCurrentInterval();

      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: interval,
        distanceInterval: 0,
        foregroundService: {
          notificationTitle: 'Journee is tracking your location',
          notificationBody: 'Your journey is being recorded',
          notificationColor: '#4F46E5',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      setIsBackgroundStarted(true);
      console.info(
        '✅ Background tracking started with interval:',
        interval / 1000,
        'seconds',
      );
    } catch (error) {
      console.error('❌ Error starting background tracking:', error);
      setIsBackgroundStarted(false);
    }
  }, [hasBackgroundPermission]);

  const stopBackgroundTracking = useCallback(async (): Promise<void> => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK,
      );

      if (isRegistered) {
        try {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
          console.info('⏹️ Background tracking stopped');
        } catch (stopError) {
          // Handle Android SharedPreferences null reference error
          // This can occur if the task wasn't properly initialized
          const errorMessage = String(stopError);
          if (errorMessage.includes('SharedPreferences') ||
            errorMessage.includes('NullPointerException')) {
            console.warn('⚠️ Task was already stopped or not properly initialized');
            // Task is likely already stopped, just unregister it
            await TaskManager.unregisterTaskAsync(BACKGROUND_LOCATION_TASK);
          } else {
            throw stopError;
          }
        }
      }

      setIsBackgroundStarted(false);
    } catch (error) {
      console.error('❌ Error stopping background tracking:', error);
      // Ensure state is updated even if stop fails
      setIsBackgroundStarted(false);
    }
  }, []);

  const restartBackgroundTracking = useCallback(async (): Promise<void> => {
    if (!isBackgroundStarted) return;

    try {
      console.info('🔄 Restarting background tracking with new interval...');
      await stopBackgroundTracking();
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      await startBackgroundTracking();
      console.info('✅ Background tracking restarted');
    } catch (error) {
      console.error('❌ Error restarting background tracking:', error);
    }
  }, [isBackgroundStarted, startBackgroundTracking, stopBackgroundTracking]);

  const startForegroundTracking = useCallback(async (): Promise<void> => {
    try {
      if (!hasLocationPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      // Check if task is already running
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        FOREGROUND_LOCATION_TASK,
      );

      if (isRegistered) {
        console.info('ℹ️ Foreground task already running');
        setIsForegroundStarted(true);
        return;
      }

      // Verify task is defined
      const taskDefined = TaskManager.isTaskDefined(
        FOREGROUND_LOCATION_TASK,
      );

      if (!taskDefined) {
        console.error('❌ Foreground location task is not defined');
        throw new Error('Foreground location task is not defined. Please restart the app.');
      }

      await Location.startLocationUpdatesAsync(FOREGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
        showsBackgroundLocationIndicator: false,
      });

      setIsForegroundStarted(true);
      console.info('✅ Foreground tracking started');
    } catch (error) {
      console.error('❌ Error starting foreground tracking:', error);
      setIsForegroundStarted(false);
    }
  }, [hasLocationPermission]);

  const stopForegroundTracking = useCallback(async (): Promise<void> => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        FOREGROUND_LOCATION_TASK,
      );

      if (isRegistered) {
        try {
          await Location.stopLocationUpdatesAsync(FOREGROUND_LOCATION_TASK);
          console.info('⏹️ Foreground tracking stopped');
        } catch (stopError) {
          // Handle Android SharedPreferences null reference error
          // This can occur if the task wasn't properly initialized
          const errorMessage = String(stopError);
          if (errorMessage.includes('SharedPreferences') ||
            errorMessage.includes('NullPointerException')) {
            console.warn('⚠️ Task was already stopped or not properly initialized');
            // Task is likely already stopped, just unregister it
            await TaskManager.unregisterTaskAsync(FOREGROUND_LOCATION_TASK);
          } else {
            throw stopError;
          }
        }
      }

      setIsForegroundStarted(false);
    } catch (error) {
      console.error('❌ Error stopping foreground tracking:', error);
      // Ensure state is updated even if stop fails
      setIsForegroundStarted(false);
    }
  }, []);

  const restartForegroundTracking = useCallback(async (): Promise<void> => {
    if (!isForegroundStarted) return;

    try {
      console.info('🔄 Restarting foreground tracking...');
      await stopForegroundTracking();
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      await startForegroundTracking();
      console.info('✅ Foreground tracking restarted');
    } catch (error) {
      console.error('❌ Error restarting foreground tracking:', error);
    }
  }, [isForegroundStarted, startForegroundTracking, stopForegroundTracking]);

  const handleAppStateChange = useCallback(async (
    nextAppState: AppStateStatus,
  ): Promise<void> => {
    if (nextAppState === 'active' && isForegroundStarted) {
      await restartForegroundTracking();
    }
  }, [isForegroundStarted, restartForegroundTracking]);

  const checkPermissions = async (): Promise<void> => {
    const foreground = await Location.getForegroundPermissionsAsync();
    const background = await Location.getBackgroundPermissionsAsync();

    setHasLocationPermission(foreground.status === 'granted');
    setHasBackgroundPermission(background.status === 'granted');
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const foreground = await Location.requestForegroundPermissionsAsync();

      if (foreground.status !== 'granted') {
        console.warn('⚠️ Foreground location permission denied');
        return false;
      }

      const background = await Location.requestBackgroundPermissionsAsync();

      if (background.status !== 'granted') {
        console.warn('⚠️ Background location permission denied');
        setHasLocationPermission(true);
        setHasBackgroundPermission(false);
        return false;
      }

      setHasLocationPermission(true);
      setHasBackgroundPermission(true);
      console.info('✅ All location permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  };

  useEffect(() => {
    void checkPermissions();
    void loadCurrentState();
  }, []);

  useEffect(() => {
    const a = async () => {
      const storedLocationData = await AsyncStorage.getItem(LOCATION_DATA);
      const lastForegroundProcess = await AsyncStorage.getItem(LAST_FOREGROUND_PROCESS);
      if (storedLocationData && lastForegroundProcess) {
        const parsedLocation: Location.LocationGeocodedAddress = JSON.parse(storedLocationData);
        const parsedLastForegroundProcess: ICoordinate = JSON.parse(lastForegroundProcess);
        console.warn(parsedLocation);
        const {street, city, region, country, formattedAddress, name, subregion} = parsedLocation;
        const newLocation: ILocation = {
          place: name || undefined,
          street: street || undefined,
          city: city || undefined,
          subregion: subregion || undefined,
          region: region || undefined,
          country: country || undefined,
          value: formattedAddress || undefined,
          coordinate: {
            latitude: parsedLastForegroundProcess.latitude,
            longitude: parsedLastForegroundProcess.longitude,
          },
        };
        setLocation(newLocation);
      }
    };
    void a();
  }, []);

  useEffect(() => {
    const checkStateChanged = async () => {
      const changed = await AsyncStorage.getItem(LOCATION_STATE_CHANGED);
      if (changed === 'true') {
        await AsyncStorage.removeItem(LOCATION_STATE_CHANGED);
        const newState = await userLocationStateService.getCurrentState();
        if (newState !== currentState) {
          setCurrentState(newState);
          setCurrentInterval(STATE_INTERVALS[newState]);

          if (isBackgroundStarted) {
            await restartBackgroundTracking();
          }
        }
      }
    };

    const interval = setInterval(checkStateChanged, 1000);
    return () => clearInterval(interval);
  }, [currentState, isBackgroundStarted, restartBackgroundTracking]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [handleAppStateChange, isForegroundStarted]);

  const value: ILocationStateContext = {
    location,
    setLocation,
    isBackgroundStarted,
    startBackgroundTracking,
    stopBackgroundTracking,
    isForegroundStarted,
    startForegroundTracking,
    stopForegroundTracking,
    currentState,
    currentInterval,
    hasLocationPermission,
    hasBackgroundPermission,
    requestPermissions,
  };

  return (
    <LocationStateContext.Provider value={value}>
      {children}
    </LocationStateContext.Provider>
  );
};
