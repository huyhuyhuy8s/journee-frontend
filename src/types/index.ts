import {GeoPoint, Timestamp} from "@firebase/firestore";

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roleId: TRole;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLogin: Timestamp | Date;
}

export type TRole = "Nintendo7131" | "Destiny4015" | "Salon4637"

export interface IUserLocationState {
  id?: string;
  userId: string;
  currentState: EUserLocationState;
  lastLocation: ILocation;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface ILocation {
  place?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  value?: string;
  coordinate: GeoPoint;
}

export enum EUserLocationState {
  FAST_MOVING = "FAST_MOVING",
  SLOW_MOVING = "SLOW_MOVING",
  STATIONARY = "STATIONARY",
}

export type TActionSetting = {
  addFriend: boolean;
  commentPost: boolean;
};

export type TVisibilitySetting = {
  journalEntries: boolean;
  locationHistory: boolean;
  location: ELocationSetting;
};

export enum ELocationSetting {
  PRECISE = "precise",
  BLURRED = "blurred",
  FROZEN = "frozen",
  HIDDEN = "hidden",
}