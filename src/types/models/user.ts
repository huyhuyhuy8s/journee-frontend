import type {ELocationSetting, EUserLocationState} from '@/constants';
import type {ILocation} from '@/types';
import type {Timestamp} from '@firebase/firestore';

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token?: string;
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

export interface IUserLocationState {
  id?: string;
  userId: string;
  currentState: EUserLocationState;
  lastLocation: ILocation;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
