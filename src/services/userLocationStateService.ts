import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {EUserLocationState, ILocationHistoryItem, IStateTransitionResult} from '@/types/location';
import {ASYNC_STORAGE_KEYS, MAX_HISTORY_SIZE, STATE_TRANSITION_THRESHOLDS} from '@/constants';
import {calculateDistance} from '@/utils/location';

const {STATE, HISTORY, LAST_LOCATION} = ASYNC_STORAGE_KEYS;
const {STATIONARY, SLOW_MOVING, FAST_MOVING} = EUserLocationState

class UserLocationStateService {
  private static instance: UserLocationStateService;

  private constructor() {
  }

  static getInstance = (): UserLocationStateService => {
    if (!UserLocationStateService.instance) {
      UserLocationStateService.instance = new UserLocationStateService();
    }
    return UserLocationStateService.instance;
  };

  addLocationToHistory = async (location: Location.LocationObject): Promise<void> => {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY);
      const history: ILocationHistoryItem[] = historyJson ? JSON.parse(historyJson) : [];

      const newItem: ILocationHistoryItem = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        speed: location.coords.speed,
      };

      history.push(newItem);

      if (history.length > MAX_HISTORY_SIZE) {
        history.shift();
      }

      await AsyncStorage.setItem(HISTORY, JSON.stringify(history));
      await AsyncStorage.setItem(LAST_LOCATION, JSON.stringify(newItem));
    } catch (error) {
      console.error('❌ Error adding location to history:', error);
    }
  };

  getLocationHistory = async (): Promise<ILocationHistoryItem[]> => {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('❌ Error getting location history:', error);
      return [];
    }
  };

  getLastLocation = async (): Promise<ILocationHistoryItem | null> => {
    try {
      const lastLocationJson = await AsyncStorage.getItem(LAST_LOCATION);
      return lastLocationJson ? JSON.parse(lastLocationJson) : null;
    } catch (error) {
      console.error('❌ Error getting last location:', error);
      return null;
    }
  };

  determineState = async (
    currentLocation: Location.LocationObject
  ): Promise<IStateTransitionResult> => {
    try {
      await this.addLocationToHistory(currentLocation);

      const history = await this.getLocationHistory();
      const currentState = await this.getCurrentState();
      const lastLocation = await this.getLastLocation();

      if (history.length < 2) {
        return {
          newState: currentState || FAST_MOVING,
          shouldUpdateInterval: false,
          velocity: 0,
        };
      }

      const velocity = this.calculateVelocity(history);
      let newState: EUserLocationState;

      switch (currentState) {
        case FAST_MOVING:
          if (velocity >= STATE_TRANSITION_THRESHOLDS.FAST_MOVING.VELOCITY) {
            newState = FAST_MOVING;
          } else if (velocity >= STATE_TRANSITION_THRESHOLDS.SLOW_MOVING.VELOCITY) {
            newState = SLOW_MOVING;
          } else {
            newState = STATIONARY;
          }
          break;

        case SLOW_MOVING:
          if (lastLocation) {
            const distance = calculateDistance(
              lastLocation.latitude,
              lastLocation.longitude,
              currentLocation.coords.latitude,
              currentLocation.coords.longitude
            );

            if (distance >= STATE_TRANSITION_THRESHOLDS.FAST_MOVING.DISTANCE) {
              newState = FAST_MOVING;
            } else if (distance >= STATE_TRANSITION_THRESHOLDS.SLOW_MOVING.DISTANCE) {
              newState = SLOW_MOVING;
            } else {
              newState = STATIONARY;
            }
          } else {
            newState = velocity >= STATE_TRANSITION_THRESHOLDS.SLOW_MOVING.VELOCITY
              ? SLOW_MOVING
              : STATIONARY;
          }
          break;

        case STATIONARY:
        default:
          if (lastLocation) {
            const distance = calculateDistance(
              lastLocation.latitude,
              lastLocation.longitude,
              currentLocation.coords.latitude,
              currentLocation.coords.longitude
            );

            if (distance >= STATE_TRANSITION_THRESHOLDS.FAST_MOVING.VELOCITY) {
              newState = FAST_MOVING;
            } else if (distance >= STATE_TRANSITION_THRESHOLDS.STATIONARY.VELOCITY) {
              newState = SLOW_MOVING;
            } else {
              newState = STATIONARY;
            }
          } else {
            newState = STATIONARY;
          }
          break;
      }

      const shouldUpdateInterval = newState !== currentState;
      const distance = lastLocation
        ? calculateDistance(
          lastLocation.latitude,
          lastLocation.longitude,
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        )
        : undefined;

      if (shouldUpdateInterval) {
        await this.setCurrentState(newState);
        console.log(`🏃 State transition: ${currentState} → ${newState} (v: ${velocity.toFixed(2)} km/h)`);
      }

      return {
        newState,
        shouldUpdateInterval,
        velocity,
        distance,
      };
    } catch (error) {
      console.error('❌ Error determining state:', error);
      return {
        newState: STATIONARY,
        shouldUpdateInterval: false,
        velocity: 0,
      };
    }
  };

  getCurrentState = async (): Promise<EUserLocationState> => {
    try {
      const state = await AsyncStorage.getItem(STATE);
      return state ? (state as EUserLocationState) : FAST_MOVING;
    } catch (error) {
      console.error('❌ Error getting current state:', error);
      return FAST_MOVING;
    }
  };

  setCurrentState = async (state: EUserLocationState): Promise<void> => {
    try {
      await AsyncStorage.setItem(STATE, state);
    } catch (error) {
      console.error('❌ Error setting current state:', error);
    }
  };

  getCurrentInterval = async (): Promise<number> => {
    const {STATE_INTERVALS} = await import('@/constants');
    const state = await this.getCurrentState();
    return STATE_INTERVALS[state];
  };

  clearLocationData = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STATE,
        HISTORY,
        LAST_LOCATION,
      ]);
      console.log('🧹 Location data cleared');
    } catch (error) {
      console.error('❌ Error clearing location data:', error);
    }
  };

  private calculateVelocity = (history: ILocationHistoryItem[]): number => {
    if (history.length < 2) return 0;

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentHistory = history.filter(item => item.timestamp >= fiveMinutesAgo);

    if (recentHistory.length < 2) {
      const latestSpeed = history[history.length - 1].speed;
      return latestSpeed !== null ? latestSpeed * 3.6 : 0;
    }

    const oldest = recentHistory[0];
    const newest = recentHistory[recentHistory.length - 1];

    const distance = calculateDistance(
      oldest.latitude,
      oldest.longitude,
      newest.latitude,
      newest.longitude
    );

    const timeInHours = (newest.timestamp - oldest.timestamp) / (1000 * 60 * 60);
    return timeInHours > 0 ? distance / timeInHours : 0;
  };
}

export default UserLocationStateService.getInstance();