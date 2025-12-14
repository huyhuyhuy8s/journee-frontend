import {
  View,
  Input,
  Text,
  XStack,
  YStack,
  useTheme,
  Avatar,
  ScrollView,
  Separator,
} from "tamagui";
import { Search, Edit3 } from "@tamagui/lucide-icons";
import React, { useEffect } from "react";
import SafeAreaVieww from "@/src/components/SafeAreaVieww";
import { useThemeValue } from "@/src/contexts/ThemeContext";

// Dữ liệu mẫu (Sample Data) - Cập nhật theo ảnh mẫu
const dummyFriends = [
  {
    id: 1,
    name: "Thomas Bui",
    avatarUrl: "https://picsum.photos/seed/thomasbui/100",
  },
  {
    id: 2,
    name: "Finn Nguyen",
    avatarUrl: "https://picsum.photos/seed/finnguyen/100",
  },
  {
    id: 3,
    name: "Alice Dang",
    avatarUrl: "https://picsum.photos/seed/alicedang/100",
  },
  {
    id: 4,
    name: "Minh Anh",
    avatarUrl: "https://picsum.photos/seed/minhanh/100",
  },
];

// --- 1. ListFriend Header Component ---
const ListFriendHeader = () => {
  const theme = useTheme();

  return (
    <XStack items="center" justify="space-between" px="$4" py="$3">
      <Text fontSize="$8" fontWeight="800" color={theme.color2}>
        List Friend
      </Text>
      {/* Biểu tượng Edit (bút chì) theo ảnh mẫu */}
      <Edit3 size="$1.5" color={theme.color2} />
    </XStack>
  );
};

// --- 2. Search Bar Component ---
const SearchBar = () => {
  const theme = useTheme();

  return (
    <XStack
      items="center"
      borderRadius={10} // Giữ borderRadius nhỏ để khớp với Input
      mx="$4"
      px="$3"
      py="$1"
      // Màu nền tối hơn, giống khối Input trong ảnh mẫu
      bg={theme.static4}
    >
      <Search size="$1" color={theme.static1} />
      <Input
        flex={1}
        placeholder="Search" // Đổi placeholder thành "Search"
        placeholderTextColor={theme.static1}
        borderWidth={0}
        bg="transparent"
        px="$2"
        fontSize="$5"
        color={theme.static1}
      />
    </XStack>
  );
};

// --- 3. Friend List Item Component ---
interface FriendItemProps {
  name: string;
  avatarUrl: string;
}

const FriendListItem: React.FC<FriendItemProps> = ({ name, avatarUrl }) => {
  const theme = useTheme();

  return (
    // Card item lớn, bo tròn, màu tối
    <XStack
      items="center"
      mx="$4"
      px="$4"
      py="$3"
      space="$4"
      borderRadius="$7"
      bg={theme.static6} // Màu nền cho card item
      cursor="pointer"
      hoverStyle={{ opacity: 0.8 }}
    >
      {/* Avatar lớn hơn một chút */}
      <Avatar circular size="$6">
        <Avatar.Image src={avatarUrl} />
        {/* Đặt fallback màu tối */}
        <Avatar.Fallback bg={theme.static5} />
      </Avatar>

      <Text fontWeight="700" color={theme.color3} fontSize="$5">
        {name}
      </Text>
    </XStack>
  );
};

// --- Main ListFriend Component ---
const ListFriend = () => {
  const theme = useTheme();
  const themeValue = useThemeValue();
  const [, setTick] = React.useState(0);

  useEffect(() => {
    // force a re-render when themeValue changes
    setTick((t) => t + 1);
  }, [themeValue]);

  return (
    <SafeAreaVieww>
      {/* Đảm bảo nền là màu tối (theme.background) */}
      <YStack flex={1} bg={theme.background}>
        <ListFriendHeader />
        <SearchBar />

        {/* Loại bỏ Separator, dùng space lớn hơn giữa các item */}
        <ScrollView flex={1} mt="$3">
          <YStack space="$3">
            {dummyFriends.map((friend) => (
              <FriendListItem key={friend.id} {...friend} />
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaVieww>
  );
};

export default ListFriend;
