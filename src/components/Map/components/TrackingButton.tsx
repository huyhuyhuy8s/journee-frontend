import React from "react";
import { Text } from "react-native";
import { Button } from "tamagui";

interface TrackingButtonProps {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const TrackingButton: React.FC<TrackingButtonProps> = ({
  isTracking,
  onStart,
  onStop,
}) => {
  return isTracking ? (
    <Button
      onPress={onStop}
      style={{
        position: "absolute",
        top: 150,
        left: 10,
        backgroundColor: "#FF6B6B",
      }}
    >
      <Text style={{ color: "white", textAlign: "center" }}>
        {"Stop\nTracking"}
      </Text>
    </Button>
  ) : (
    <Button
      onPress={onStart}
      style={{
        position: "absolute",
        top: 150,
        left: 10,
        backgroundColor: "#4CAF50",
      }}
    >
      <Text style={{ color: "white", textAlign: "center" }}>
        {"Start\nTracking"}
      </Text>
    </Button>
  );
};
