import React, { useEffect } from "react";
import { Button, useTheme, XStack, YStack } from "tamagui";
import { Bell, MapPinned, Search } from "@tamagui/lucide-icons";
import SafeAreaVieww from "@/src/components/SafeAreaVieww";
import Filter from "@/src/components/newsfeed/Filter";
import StatusBar from "@/src/components/newsfeed/StatusBar";
import { useThemeValue } from "@/src/contexts/ThemeContext";

const HeaderNav = () => {
  const theme = useTheme();

  return (
    <XStack paddingInline={20} paddingBlock={10} justify="space-between">
      <Bell size="$1.5" color={theme.static15} />
      <MapPinned size="$3" color={theme.color3} />
      <Search size="$1.5" color={theme.static15} />
    </XStack>
  );
};

const Newsfeed = () => {
  const theme = useTheme();
  const themeValue = useThemeValue();
  const [, setTick] = React.useState(0);

  useEffect(() => {
    // force a re-render when themeValue changes
    setTick((t) => t + 1);
  }, [themeValue]);
  return (
    <SafeAreaVieww>
      <YStack bg={theme.background} height="100%">
        <HeaderNav />
        <YStack gap={10}>
          <Filter />
          <StatusBar />
        </YStack>
      </YStack>
    </SafeAreaVieww>
  );
};

export default Newsfeed;
