import {IRegion} from "@/types";

// Default initial region for map view (San Francisco, zoomed out for overview)
export const DEFAULT_REGION: IRegion = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

// Threshold for determining if two locations are the same (in kilometers)
export const SAME_LOCATION_THRESHOLD = 0.05;

// Threshold for determining if region should update (in degrees, ~11 meters)
export const REGION_UPDATE_THRESHOLD = 0.0001;

// Default delta values for current location tracking (zoomed in for detailed view)
// These are smaller than DEFAULT_REGION deltas to provide a closer view when tracking user
export const DEFAULT_LATITUDE_DELTA = 0.01;
export const DEFAULT_LONGITUDE_DELTA = 0.01;