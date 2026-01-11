import React, {
  createContext,
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, type AppStateStatus} from 'react-native';
import userLocationStateService from '@/services/userLocationStateService';
import locationTrackingService from '@/services/locationTrackingService';
import {ASYNC_STORAGE_KEYS, DEFAULT_LOCATION_CONTEXT, EUserLocationState, STATE_INTERVALS} from '@/constants';
import {type ICoordinate, type ILocation} from '@/types';
import {useRegion} from '@/contexts/RegionContext';

const {FAST_MOVING} = EUserLocationState;
const {LOCATION_DATA, LAST_FOREGROUND_PROCESS, LOCATION_STATE_CHANGED} = ASYNC_STORAGE_KEYS;

interface ILocationStateContext {
  location: ILocation;
  setLocation: Dispatch<SetStateAction<ILocation>>;
  isBackgroundStarted: boolean;
  startBackgroundTracking: () => Promise<void>;
  stopBackgroundTracking: () => Promise<void>;
  isForegroundStarted: boolean;
  startForegroundTracking: () => Promise<void>;
  stopForegroundTracking: () => Promise<void>;
  currentState: EUserLocationState;
  currentInterval: number;
  statusBackgroundPermission: Location.LocationPermissionResponse | null;
  statusForegroundPermission: Location.LocationPermissionResponse | null;
}

const LocationStateContext = createContext<ILocationStateContext | undefined>(undefined);

export const useLocationState = (): ILocationStateContext => {
  const context = useContext(LocationStateContext);
  if (!context) {
    throw new Error('useLocationState must be used within LocationStateProvider');
  }
  return context;
};

export const LocationStateProvider: FC<{ children: ReactNode }> = ({children}) => {
  const [location, setLocation] = useState<ILocation>(DEFAULT_LOCATION_CONTEXT);
  const [isBackgroundStarted, setIsBackgroundStarted] = useState(false);
  const [isForegroundStarted, setIsForegroundStarted] = useState(false);
  const [currentState, setCurrentState] = useState<EUserLocationState>(FAST_MOVING);
  const [currentInterval, setCurrentInterval] = useState<number>(STATE_INTERVALS[FAST_MOVING]);
  const [statusBackgroundPermission] = Location.useBackgroundPermissions();
  const [statusForegroundPermission] = Location.useForegroundPermissions();
  const {region} = useRegion();

  useEffect(() => {
    const loadState = async () => {
      const state = await userLocationStateService.getCurrentState();
      setCurrentState(state);
      setCurrentInterval(STATE_INTERVALS[state]);

      const bgActive = await locationTrackingService.isBackgroundTrackingActive();
      const fgActive = await locationTrackingService.isForegroundTrackingActive();
      setIsBackgroundStarted(bgActive);
      setIsForegroundStarted(fgActive);
    };
    void loadState();
  }, []);

  useEffect(() => {
    const loadLocation = async () => {
      const storedLocationData = await AsyncStorage.getItem(LOCATION_DATA);
      const lastForegroundProcess = await AsyncStorage.getItem(LAST_FOREGROUND_PROCESS);

      if (storedLocationData && lastForegroundProcess) {
        const parsedLocation: Location.LocationGeocodedAddress = JSON.parse(storedLocationData);
        const parsedCoordinate: ICoordinate = JSON.parse(lastForegroundProcess);

        const newLocation: ILocation = {
          place: parsedLocation.name || undefined,
          street: parsedLocation.street || undefined,
          city: parsedLocation.city || undefined,
          subregion: parsedLocation.subregion || undefined,
          region: parsedLocation.region || undefined,
          country: parsedLocation.country || undefined,
          value: parsedLocation.formattedAddress || undefined,
          coordinate: parsedCoordinate,
        };
        setLocation(newLocation);
      }
    };
    void loadLocation();
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
            await locationTrackingService.restartBackgroundTracking();
          }
        }
      }
    };

    void checkStateChanged();
  }, [currentState, isBackgroundStarted, region]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isForegroundStarted) {
        await locationTrackingService.stopForegroundTracking();
        await new Promise(resolve => setTimeout(resolve, 300));
        await locationTrackingService.startForegroundTracking();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isForegroundStarted]);

  const startBackgroundTracking = useCallback(async () => {
    const hasPermission = statusBackgroundPermission?.granted ||
      await locationTrackingService.requestBackgroundPermission();

    if (!hasPermission) return;

    const started = await locationTrackingService.startBackgroundTracking();
    setIsBackgroundStarted(started);
  }, [statusBackgroundPermission]);

  const stopBackgroundTracking = useCallback(async () => {
    await locationTrackingService.stopBackgroundTracking();
    setIsBackgroundStarted(false);
  }, []);

  const startForegroundTracking = useCallback(async () => {
    const hasPermission = statusForegroundPermission?.granted ||
      await locationTrackingService.requestForegroundPermission();

    if (!hasPermission) return;

    const started = await locationTrackingService.startForegroundTracking();
    setIsForegroundStarted(started);
  }, [statusForegroundPermission]);

  const stopForegroundTracking = useCallback(async () => {
    await locationTrackingService.stopForegroundTracking();
    setIsForegroundStarted(false);
  }, []);

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
    statusBackgroundPermission,
    statusForegroundPermission,
  };

  return (
    <LocationStateContext.Provider value={value}>
      {children}
    </LocationStateContext.Provider>
  );
};
