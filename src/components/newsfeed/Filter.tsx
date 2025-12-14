import { Button, Text, useTheme, XStack } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useNavigation } from "@react-navigation/native";

const Filter = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  // Hàm xử lý chuyển hướng
  const handleFeedPress = () => {
    navigation.navigate("feed" as never);
  };

  const handleNowPress = () => {};

  return (
    <XStack width="100%" gap="$2" paddingInline={10}>
      <Button
        flex={1}
        borderRadius={50}
        bg={theme.primary}
        onPress={handleNowPress}
      >
        <Text color={theme.static3} fontWeight="900" fontSize="$4">
          Now
        </Text>
      </Button>
      <Button
        flex={1}
        borderRadius={50}
        bg={theme.color1}
        onPress={handleNowPress}
      >
        <Text color={theme.color7} fontWeight="900" fontSize="$4">
          Feed
        </Text>
      </Button>
    </XStack>
  );
};

export default Filter;
