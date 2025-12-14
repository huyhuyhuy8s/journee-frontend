// components/SafeAreaVieww.tsx
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "tamagui";

interface SafeAreaViewwProps {
  children: React.ReactNode;
  style?: any;
}

const SafeAreaVieww: React.FC<SafeAreaViewwProps> = ({ children, style }) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: theme.background.val,
        },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaVieww;
