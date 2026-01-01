export const MAX_HISTORY_SIZE = 10;
export const SAME_LOCATION_THRESHOLD = 0.05;
export const MIN_VISIT_DURATION = 60000;

export enum EUserLocationState {
  FAST_MOVING = "FAST_MOVING",
  SLOW_MOVING = "SLOW_MOVING",
  STATIONARY = "STATIONARY",
}

export const STATE_INTERVALS = {
  [EUserLocationState.FAST_MOVING]: 5000,
  [EUserLocationState.SLOW_MOVING]: 1800000,
  [EUserLocationState.STATIONARY]: 3600000,
}

export const STATE_TRANSITION_THRESHOLDS = {
  [EUserLocationState.FAST_MOVING]: {
    VELOCITY: 5,
    DISTANCE_30_MINUTES: 2.5,
    DISTANCE_60_MINUTES: 5,
  },
  [EUserLocationState.SLOW_MOVING]: {
    VELOCITY: 2.5,
    DISTANCE_30_MINUTES: 0.5,
    DISTANCE_60_MINUTES: 1,
  },
  [EUserLocationState.STATIONARY]: {
    VELOCITY: 1.0,
    DISTANCE_30_MINUTES: 0,
    DISTANCE_60_MINUTES: 0,
  },
}