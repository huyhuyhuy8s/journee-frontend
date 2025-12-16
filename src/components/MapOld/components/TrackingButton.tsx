import React from "react";
import {TouchableOpacity} from "react-native";
import {Text} from "@/components/global";

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
    <TouchableOpacity
      onPress={onStop}
      style={{
        position: "absolute",
        top: 150,
        left: 10,
        backgroundColor: "#FF6B6B",
      }}
    >
      <Text style={{color: "white", textAlign: "center"}}>
        {"Stop\nTracking"}
      </Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      onPress={onStart}
      style={{
        position: "absolute",
        top: 150,
        left: 10,
        backgroundColor: "#4CAF50",
      }}
    >
      <Text style={{color: "white", textAlign: "center"}}>
        {"Start\nTracking"}
      </Text>
    </TouchableOpacity>
  );
};
