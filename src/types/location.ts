import type * as Location from 'expo-location';
import type {EUserLocationState} from '@/constants';

export interface ILocationHistoryItem {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed: number | null;
}

export interface IStateTransitionResult {
  newState: EUserLocationState;
  shouldUpdateInterval: boolean;
  velocity: number;
  distance?: number;
}

export interface IRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface IPendingVisit {
  location: Location.LocationObject;
  startTime: number;
  lastUpdateTime: number;
}
