// components/GlobalLoading.tsx
import React from "react";
import { Spinner, Text, YStack, useTheme } from "tamagui";
import { useIsLoading, useLoadingMessage } from "@/src/contexts/AppStateContext";

export const GlobalLoading: React.FC = () => {
  const theme = useTheme();
  const isLoading = useIsLoading();
  const loadingMessage = useLoadingMessage();

  if (!isLoading) return null;

  return (
    <YStack
      position="absolute"
      t={0}
      l={0}
      r={0}
      b={0}
      bg="rgba(0,0,0,0.5)"
      justify="center"
      items="center"
      z={9999}
    >
      <YStack
        bg={theme.background.val}
        p="$4"
        br={12}
        items="center"
        gap="$3"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={4}
        elevation={5}
      >
        <Spinner size="large" color={theme.accent1.val} />
        {loadingMessage && (
          <Text
            color={theme.color11.val}
            fontSize="$4"
            fontWeight="500"
            text="center"
          >
            {loadingMessage}
          </Text>
        )}
      </YStack>
    </YStack>
  );
};
