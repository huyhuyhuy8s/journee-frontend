// components/Map/types/index.ts
import * as Location from "expo-location";

export interface Address {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
  place?: string;
  confidence?: string;
  source?: string;
  value?: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface LocationState {
  location: Location.LocationObject | null;
  region: MapRegion | null;
  address: Address;
  isLoading: boolean;
  error: string | null;
}

export interface MovementAnalysis {
  currentSpeed: number;
  distanceTraveled: number;
  timeDelta: number;
}

export interface LocationData extends Location.LocationObject {
  movementState: string;
  speed: number;
  averageSpeed: number;
  timeSinceStateChange: number;
}
