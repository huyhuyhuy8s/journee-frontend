import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, AppStateStatus} from 'react-native';
import userLocationStateService from '@/services/userLocationStateService';
import {ASYNC_STORAGE_KEYS, STATE_INTERVALS} from '@/constants';
import {EUserLocationState} from '@/types/location';
import {BACKGROUND_LOCATION_TASK, FOREGROUND_LOCATION_TASK} from "@/features/map/task";

const {LOCATION_STATE_CHANGED} = ASYNC_STORAGE_KEYS;

interface ILocationStateContext {
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

const LocationStateContext = createContext<ILocationStateContext | undefined>(undefined);

export const useLocationState = (): ILocationStateContext => {
  const context = useContext(LocationStateContext);
  if (!context) {
    throw new Error('useLocationState must be used within LocationStateProvider');
  }
  return context;
};

interface ILocationStateProviderProps {
  children: ReactNode;
}

export const LocationStateProvider: React.FC<ILocationStateProviderProps> = ({children}) => {
  const [isBackgroundStarted, setIsBackgroundStarted] = useState<boolean>(false);
  const [isForegroundStarted, setIsForegroundStarted] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<EUserLocationState>(EUserLocationState.FAST_MOVING);
  const [currentInterval, setCurrentInterval] = useState<number>(STATE_INTERVALS[EUserLocationState.FAST_MOVING]);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState<boolean>(false);

  useEffect(() => {
    checkPermissions().then();
    loadCurrentState().then();
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
  }, [currentState, isBackgroundStarted]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isForegroundStarted]);

  const loadCurrentState = async (): Promise<void> => {
    const state = await userLocationStateService.getCurrentState();
    setCurrentState(state);
    setCurrentInterval(STATE_INTERVALS[state]);
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
    if (nextAppState === 'active' && isForegroundStarted) {
      await restartForegroundTracking();
    }
  };

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
      console.log('✅ All location permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  };

  const startBackgroundTracking = async (): Promise<void> => {
    try {
      if (!hasBackgroundPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);

      if (isRegistered) {
        console.log('ℹ️ Background task already running');
        setIsBackgroundStarted(true);
        return;
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
      console.log('✅ Background tracking started with interval:', interval / 1000, 'seconds');
    } catch (error) {
      console.error('❌ Error starting background tracking:', error);
    }
  };

  const stopBackgroundTracking = async (): Promise<void> => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);

      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log('⏹️ Background tracking stopped');
      }

      setIsBackgroundStarted(false);
    } catch (error) {
      console.error('❌ Error stopping background tracking:', error);
    }
  };

  const restartBackgroundTracking = async (): Promise<void> => {
    if (!isBackgroundStarted) return;

    console.log('🔄 Restarting background tracking with new interval...');
    await stopBackgroundTracking();
    await startBackgroundTracking();
  };

  const startForegroundTracking = async (): Promise<void> => {
    try {
      if (!hasLocationPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      const isRegistered = await TaskManager.isTaskRegisteredAsync(FOREGROUND_LOCATION_TASK);

      if (isRegistered) {
        console.log('ℹ️ Foreground task already running');
        setIsForegroundStarted(true);
        return;
      }

      await Location.startLocationUpdatesAsync(FOREGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
        showsBackgroundLocationIndicator: false,
      });

      setIsForegroundStarted(true);
      console.log('✅ Foreground tracking started');
    } catch (error) {
      console.error('❌ Error starting foreground tracking:', error);
    }
  };

  const stopForegroundTracking = async (): Promise<void> => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(FOREGROUND_LOCATION_TASK);

      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(FOREGROUND_LOCATION_TASK);
        console.log('⏹️ Foreground tracking stopped');
      }

      setIsForegroundStarted(false);
    } catch (error) {
      console.error('❌ Error stopping foreground tracking:', error);
    }
  };

  const restartForegroundTracking = async (): Promise<void> => {
    if (!isForegroundStarted) return;

    await stopForegroundTracking();
    await startForegroundTracking();
    console.log('🔄 Foreground tracking restarted');
  };

  const value: ILocationStateContext = {
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