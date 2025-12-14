import { Text, YStack, Avatar, useTheme, XStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";

const StatusBar = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("NewPost" as never);
  };

  return (
    <XStack
      paddingInline={10}
      paddingBlock={10}
      gap={10}
      onPress={handlePress}
      pressStyle={{ opacity: 0.8 }}
      cursor="pointer"
    >
      <Avatar circular size="$5">
        <Avatar.Image src="https://picsum.photos/seed/thomas/100" />
        <Avatar.Fallback bg={theme.static1} />
      </Avatar>

      <YStack justify="center" flex={1}>
        <Text fontSize="$5" fontWeight="bold" color={theme.color1}>
          Thomas Bui
        </Text>
        <Text fontSize="$4" color={theme.static15}>
          What's new?
        </Text>
      </YStack>
    </XStack>
  );
};

export default StatusBar;
