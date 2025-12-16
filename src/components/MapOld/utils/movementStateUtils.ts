import * as Location from "expo-location";
import { MOVEMENT_STATES } from "./constants";

export const determineMovementState = (speed: number) => {
  if (speed >= MOVEMENT_STATES.FAST_MOVING.threshold) {
    return MOVEMENT_STATES.FAST_MOVING;
  } else if (speed >= MOVEMENT_STATES.SLOW_MOVING.threshold) {
    return MOVEMENT_STATES.SLOW_MOVING;
  } else {
    return MOVEMENT_STATES.STATIONARY;
  }
};

export const getNotificationColor = (stateName: string): string => {
  switch (stateName) {
    case "FAST_MOVING":
      return "#FF6B6B";
    case "SLOW_MOVING":
      return "#4ECDC4";
    case "STATIONARY":
      return "#45B7D1";
    default:
      return "#007AFF";
  }
};

export const getActivityType = (stateName: string): Location.ActivityType => {
  switch (stateName) {
    case "FAST_MOVING":
      return Location.ActivityType.AutomotiveNavigation;
    case "SLOW_MOVING":
      return Location.ActivityType.Fitness;
    case "STATIONARY":
      return Location.ActivityType.Other;
    default:
      return Location.ActivityType.Other;
  }
};
