import * as Location from "expo-location";

export const BACKGROUND_LOCATION_TASK = "background-location";

export const STORAGE_KEYS = {
  LAST_LOCATION: "lastBackgroundLocation",
  LAST_SPEED: "lastSpeed",
  MOVEMENT_STATE: "movementState",
  STATE_CHANGE_TIME: "stateChangeTime",
  STATE_STABILITY_BUFFER: "stateStabilityBuffer",
  UPDATE_INTERVAL: "updateInterval",
} as const;

export const STATE_STABILITY_CONFIG = {
  MIN_DURATION_MS: 5 * 60 * 1000,
  SAMPLE_BUFFER_SIZE: 10,
} as const;

export const MOVEMENT_STATES = {
  STATIONARY: {
    name: "STATIONARY",
    threshold: 0,
    updateInterval: 3600000,
    distanceInterval: 200,
    accuracy: Location.Accuracy.Balanced,
  },
  SLOW_MOVING: {
    name: "SLOW_MOVING",
    threshold: 1,
    updateInterval: 1800000,
    distanceInterval: 100,
    accuracy: Location.Accuracy.Balanced,
  },
  FAST_MOVING: {
    name: "FAST_MOVING",
    threshold: 5,
    updateInterval: 5000,
    distanceInterval: 20,
    accuracy: Location.Accuracy.High,
  },
} as const;
