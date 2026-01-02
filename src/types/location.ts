import type { Timestamp } from '@firebase/firestore';
import type * as Location from 'expo-location';
import type { ILocation } from '@/types/models/location';
import type { EUserLocationState } from '@/constants';

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

export interface IJournal {
  id: string;
  userId: string;
  name: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  entries?: IEntry[];
}

export interface IEntry {
  id?: string;
  journalId: string;
  name?: string;
  location: ILocation;
  images: string[];
  thought?: string;
  arrivalTime: Timestamp | Date;
  departureTime?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface IPendingVisit {
  location: Location.LocationObject;
  startTime: number;
  lastUpdateTime: number;
}
