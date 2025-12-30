import {IRegion} from "@/types";

export const DEFAULT_REGION: IRegion = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

export const SAME_LOCATION_THRESHOLD = 0.05;

// Default delta values for location regions (zoom level)
export const DEFAULT_LATITUDE_DELTA = 0.01;
export const DEFAULT_LONGITUDE_DELTA = 0.01;