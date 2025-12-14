import { Button, Text, useTheme, View, XStack } from "tamagui";

const LargeButton = ({
  icon,
  title,
  onPress,
}: {
  icon: any;
  title: string;
  onPress?: () => void;
}) => {
  const theme = useTheme();

  return (
    <View>
      <Button bg={theme.color1} onPress={onPress}>
        <XStack items="center" width="100%" justify="flex-start" gap="$2">
          {icon}
          <Text color={theme.background} fontWeight="bold" fontSize="$5">
            {title}
          </Text>
        </XStack>
      </Button>
    </View>
  );
};

export default LargeButton;
