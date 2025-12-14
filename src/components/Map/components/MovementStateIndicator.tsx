import React from "react";
import { Text } from "react-native";

interface MovementStateInfo {
  color: string;
  text: string;
  speed: string;
  stability: string;
}

interface MovementStateIndicatorProps {
  movementInfo: MovementStateInfo;
}

export const MovementStateIndicator: React.FC<MovementStateIndicatorProps> = ({
  movementInfo,
}) => {
  return (
    <Text
      style={{
        position: "absolute",
        top: 100,
        right: 10,
        backgroundColor: movementInfo.color,
        color: "white",
        padding: 8,
        borderRadius: 5,
        fontSize: 12,
        textAlign: "center",
      }}
    >
      {movementInfo.text}
      {"\n"}
      {movementInfo.speed}
      {"\n"}
      {movementInfo.stability}
    </Text>
  );
};
