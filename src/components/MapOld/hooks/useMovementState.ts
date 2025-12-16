// components/Map/hooks/useMovementState.ts
import {useEffect, useState} from "react";
import {StorageService} from "@/components/Map/services/storageService";
import {MOVEMENT_STATES, STATE_STABILITY_CONFIG} from "@/components/Map/utils/constants";
import {getIntervalText} from "@/components/Map/utils/locationUtils";
import {getNotificationColor} from "@/components/Map/utils/movementStateUtils";

export const useMovementState = () => {
  const [currentMovementState, setCurrentMovementState] =
    useState("FAST_MOVING");
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [timeSinceStateChange, setTimeSinceStateChange] = useState(0);

  useEffect(() => {
    const updateUIFromBackground = async () => {
      try {
        const uiData = await StorageService.getUIData();
        if (uiData) {
          setCurrentMovementState(uiData.movementState);
          setCurrentSpeed(uiData.currentSpeed);
          setTimeSinceStateChange(uiData.timeSinceStateChange);
        }
      } catch (error) {
        console.error("❌ Error updating UI from background:", error);
      }
    };

    updateUIFromBackground();
    const interval = setInterval(updateUIFromBackground, 2000);
    return () => clearInterval(interval);
  }, []);

  const getMovementStateInfo = () => {
    const stateConfig = Object.values(MOVEMENT_STATES).find(
      (s) => s.name === currentMovementState
    );
    if (!stateConfig)
      return {color: "#999", text: "Unknown", speed: "0 km/h", stability: ""};

    const intervalText = getIntervalText(stateConfig.updateInterval);
    const stabilityTime = Math.round(timeSinceStateChange / 1000);
    const minTime = Math.round(STATE_STABILITY_CONFIG.MIN_DURATION_MS / 1000);
    const isStable = stabilityTime >= minTime;
    const stabilityIndicator = isStable ? "🔒" : "⏳";

    return {
      color: getNotificationColor(currentMovementState),
      text: `${currentMovementState.replace("_", " ")} (${intervalText})`,
      speed: currentSpeed.toFixed(1) + " km/h",
      stability: `${stabilityIndicator} ${stabilityTime}/${minTime}s`,
    };
  };

  return {
    currentMovementState,
    currentSpeed,
    timeSinceStateChange,
    getMovementStateInfo,
  };
};
