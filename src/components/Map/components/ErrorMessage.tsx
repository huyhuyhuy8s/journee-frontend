import React from "react";
import { Text } from "react-native";

interface ErrorMessageProps {
  errorMsg: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorMsg }) => {
  if (!errorMsg) return null;

  return (
    <Text
      style={{
        position: "absolute",
        top: 100,
        left: 10,
        backgroundColor: "rgba(255, 136, 136, 0.8)",
        padding: 10,
        borderRadius: 5,
      }}
    >
      {errorMsg}
    </Text>
  );
};
