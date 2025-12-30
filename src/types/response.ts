import {GeoPoint} from "@firebase/firestore";

export interface IBackendResponse {
  status: number,
  message: string,
  error?: string,
}

export interface IBackendResponseError {
  meta: {
    status: number;
    message: string;
    error: string;
  }
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
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

export interface ILocation {
  place?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  value?: string;
  coordinate: GeoPoint;
}

export interface IPost {
  id: string;
  userId: string;
  caption: string;
  images?: string[];
  journal?: IJournal[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface IComment {
  id: string;
  userId: string;
  postId: string;
  context?: string;
  image?: string;
  createdAt: Timestamp | Date;
}

export type TReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface IReaction {
  id: string;
  userId: string;
  postId: string;
  reactionType: TReactionType;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type TMessageType =
  | string
  | ILocation
  | IJournal
  | IEntry
  | TReactionType;

export interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  context: TMessageType;
  createdAt: Timestamp | Date;
}