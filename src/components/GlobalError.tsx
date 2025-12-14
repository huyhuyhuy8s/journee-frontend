// components/GlobalError.tsx
import React from "react";
import { Button, Text, XStack, YStack, useTheme } from "tamagui";
import { X } from "@tamagui/lucide-icons";
import { useError, useAppState } from "@/src/contexts/AppStateContext";

export const GlobalError: React.FC = () => {
  const theme = useTheme();
  const error = useError();
  const { clearError } = useAppState();

  if (!error) return null;

  return (
    <YStack
      position="absolute"
      t={60}
      l={10}
      r={10}
      bg={theme.red9.val}
      p="$3"
      br={8}
      z={9998}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.25}
      shadowRadius={4}
      elevation={5}
    >
      <XStack items="center" justify="space-between">
        <Text color="white" fontSize="$3" fontWeight="500" flex={1}>
          {error}
        </Text>
        <Button size="$2" circular bg="transparent" onPress={clearError}>
          <X size={16} color="white" />
        </Button>
      </XStack>
    </YStack>
  );
};
