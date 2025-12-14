import {
  Toast,
  ToastViewport,
  useToastController,
  useToastState,
} from "@tamagui/toast";
import React from "react";
import {
  Button,
  ColorTokens,
  isWeb,
  useTheme,
  View,
  XStack,
  YStack,
} from "tamagui";

const CurrentToast = ({ theme }: { theme: ColorTokens }) => {
  const toast = useToastState();

  if (!toast || toast.isHandledNatively) {
    return null;
  }

  return (
    <Toast
      key={toast.id}
      duration={toast.duration}
      viewportName={toast.viewport}
      bg={theme}
    >
      <Toast.Title>{toast.title}</Toast.Title>
      <Toast.Description>{toast.message}</Toast.Description>
    </Toast>
  );
};

const ToastControl = ({ theme }: { theme: ColorTokens }) => {
  const toast = useToastController();
  const native = !isWeb;

  return (
    <XStack gap="$2" justify="center">
      <Button
        onPress={() => {
          toast.show("Successfully saved!", {
            message: "Don't worry, we've got your data.",
            native,
            demo: true,
          });
        }}
        bg={theme}
      >
        Show
      </Button>
      <Button
        onPress={() => {
          toast.hide();
        }}
      >
        Hide
      </Button>
    </XStack>
  );
};

const index = () => {
  const theme = useTheme();
  const accent1 = theme.accent1 as unknown as ColorTokens;

  return (
    <View height="100%" width="100%" justify="center" gap="$2">
      <YStack gap="$2">
        <ToastControl theme={accent1} />
        <CurrentToast theme={accent1} />
      </YStack>

      <ToastViewport bottom={10} alignSelf="center" />
    </View>
  );
};

export default index;
