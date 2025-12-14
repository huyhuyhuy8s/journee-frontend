import { STATE_STABILITY_CONFIG } from "./constants";

export const validateStateChange = async (
  currentState: string,
  newState: string,
  speedBuffer: number[],
  averageSpeed: number
): Promise<boolean> => {
  if (speedBuffer.length < 3) return false;

  const maxSpeed = Math.max(...speedBuffer);
  const minSpeed = Math.min(...speedBuffer);

  console.log(`🔍 Validating ${currentState} → ${newState}:`, {
    avgSpeed: averageSpeed.toFixed(2),
    maxSpeed: maxSpeed.toFixed(2),
    minSpeed: minSpeed.toFixed(2),
  });

  switch (`${currentState}->${newState}`) {
    case "FAST_MOVING->STATIONARY":
      const isStationary = averageSpeed < 0.5 && maxSpeed < 2;
      console.log(
        `📍 STATIONARY check: avgSpeed < 0.5 (${averageSpeed.toFixed(
          2
        )}) && maxSpeed < 2 (${maxSpeed.toFixed(2)}) = ${isStationary}`
      );
      return isStationary;

    case "FAST_MOVING->SLOW_MOVING":
      const isSlow = averageSpeed < 3 && maxSpeed < 5;
      console.log(
        `🚶 SLOW_MOVING check: avgSpeed < 3 (${averageSpeed.toFixed(
          2
        )}) && maxSpeed < 5 (${maxSpeed.toFixed(2)}) = ${isSlow}`
      );
      return isSlow;

    case "SLOW_MOVING->STATIONARY":
      const isStationaryFromSlow = averageSpeed < 0.5 && maxSpeed < 1;
      console.log(
        `📍 STATIONARY from SLOW check: avgSpeed < 0.5 (${averageSpeed.toFixed(
          2
        )}) && maxSpeed < 1 (${maxSpeed.toFixed(2)}) = ${isStationaryFromSlow}`
      );
      return isStationaryFromSlow;

    case "STATIONARY->SLOW_MOVING":
      const isSlowFromStationary = averageSpeed > 1 && minSpeed > 0.5;
      console.log(
        `🚶 SLOW from STATIONARY check: avgSpeed > 1 (${averageSpeed.toFixed(
          2
        )}) && minSpeed > 0.5 (${minSpeed.toFixed(
          2
        )}) = ${isSlowFromStationary}`
      );
      return isSlowFromStationary;

    case "STATIONARY->FAST_MOVING":
    case "SLOW_MOVING->FAST_MOVING":
      const isFast = averageSpeed > 5 && minSpeed > 3;
      console.log(
        `🏃 FAST_MOVING check: avgSpeed > 5 (${averageSpeed.toFixed(
          2
        )}) && minSpeed > 3 (${minSpeed.toFixed(2)}) = ${isFast}`
      );
      return isFast;

    default:
      console.log(
        `✅ Default validation passed for ${currentState} → ${newState}`
      );
      return true;
  }
};
