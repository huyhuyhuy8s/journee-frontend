import {EUserLocationState} from "@/types/location";

export const MAX_HISTORY_SIZE = 10;
export const SAME_LOCATION_THRESHOLD = 0.05;
export const MIN_VISIT_DURATION = 60000;

export const STATE_INTERVALS = {
  [EUserLocationState.FAST_MOVING]: 5000,
  [EUserLocationState.SLOW_MOVING]: 1800000,
  [EUserLocationState.STATIONARY]: 3600000,
}

export const STATE_TRANSITION_THRESHOLDS = {
  [EUserLocationState.FAST_MOVING]: {
    VELOCITY: 5.0,
    DISTANCE: 2.5,
  },
  [EUserLocationState.SLOW_MOVING]: {
    VELOCITY: 2.5,
    DISTANCE: 0.5,
  },
  [EUserLocationState.STATIONARY]: {
    VELOCITY: 1.0,
    DISTANCE: 0.0,
  },
}