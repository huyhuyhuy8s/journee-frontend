import React from "react";
import {
  Text,
  useTheme,
  XStack,
  YStack,
  View,
  Button,
  Separator,
} from "tamagui";
import SafeAreaVieww from "@/src/components/SafeAreaVieww";
import {
  User, // Update Account, Account
  Lock, // Security
  ShieldCheck, // Wall Privacy (Checkmark)
  Globe, // Wall Privacy (Globe/General) - Dùng tạm do icon mẫu không có sẵn
  ArrowLeft,
  ChevronRight,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";

// --- 1. Custom Header Component ---
const SettingHeader = () => {
  const theme = useTheme();
  return (
    <XStack
      items="center"
      justify="space-between"
      px="$4"
      py="$3"
      borderBottomWidth={1}
      borderColor={theme.static1}
    >
      <Button
        icon={<ArrowLeft size={20} color={theme.color1} />}
        onPress={() => router.back()}
        chromeless
        p={0}
      />
      <Text fontSize="$6" fontWeight="900" color={theme.color1}>
        Setting
      </Text>
      <View width={20} /> {/* Giữ khoảng trống để căn giữa tiêu đề */}
    </XStack>
  );
};

// --- 2. Custom Setting Item Component ---
interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  isLast?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  onPress,
  isLast = false,
}) => {
  const theme = useTheme();
  const borderRadius = 8;
  const height = 60;

  return (
    <Button
      onPress={onPress}
      chromeless
      px="$4"
      py="$3"
      borderRadius={borderRadius}
      // 🟢 Thay đổi: Xóa màu nền
      bg="transparent"
      height={height}
      // Hiệu ứng nhấn/chạm
      hoverStyle={{ bg: theme.static4 || theme.color4 }}
      pressStyle={{ bg: theme.static6 || theme.color8 }}
    >
      <XStack items="center" justify="space-between" flex={1}>
        {/* Icon và Title */}
        <XStack items="center" space="$3">
          {/* Icon */}
          {React.cloneElement(icon as React.ReactElement, {
            size: 20,
            color: theme.color1,
          })}
          <Text fontSize="$5" fontWeight="500" color={theme.color1}>
            {title}
          </Text>
        </XStack>

        {/* 🔴 Xóa ChevronRight */}
      </XStack>

      {/* Thêm Separator mỏng giữa các item (tương tự như trong hình mẫu tối giản)
      {!isLast && (
        <Separator
          position="absolute"
          b={0}
          l="$4"
          r="$4"
          borderColor={theme.static4}
        />
      )} */}
    </Button>
  );
};

// --- Main Setting Component ---
const Setting = () => {
  const theme = useTheme();

  // Định nghĩa các mục menu
  const menuItems = [
    {
      title: "Update Account",
      icon: <User />,
      onPress: () => router.push("/updateinfo"),
    },
    { title: "Account", icon: <User />, onPress: () => alert("Account") },
    { title: "Security", icon: <Lock />, onPress: () => alert("Security") },
    {
      title: "Wall Privacy",
      icon: <ShieldCheck />,
      onPress: () => alert("Wall Privacy 1"),
    },
  ];

  return (
    <SafeAreaVieww>
      <YStack flex={1} bg={theme.background}>
        <SettingHeader />

        {/* Danh sách các mục cài đặt */}
        <YStack marginInline="$4" py="$4">
          {menuItems.map((item, index) => (
            <SettingItem
              key={index}
              title={item.title}
              icon={item.icon}
              onPress={item.onPress}
              isLast={index === menuItems.length - 1}
            />
          ))}
        </YStack>
      </YStack>
    </SafeAreaVieww>
  );
};

export default Setting;
