import React, { useState } from "react";
import {
  Button,
  Separator,
  Text,
  XStack,
  YStack,
  useTheme,
  Avatar,
  ScrollView,
} from "tamagui";
import {
  Edit3,
  Globe,
  Heart,
  MessageCircle,
  Share2,
} from "@tamagui/lucide-icons";
import SafeAreaVieww from "@/src/components/SafeAreaVieww";
import { useNavigation } from "@react-navigation/native";

// --- Dữ liệu Mẫu ---
const dummyPosts = [
  {
    id: 1,
    author: "Astro Lovar",
    content:
      "Vừa chia sẻ một quan điểm mới về kiến trúc component! Mọi người nghĩ sao về cách tiếp cận này? Tôi nghĩ nó giúp quản lý trạng thái dễ dàng hơn nhiều.",
    time: "5m ago",
    avatarUrl: "https://picsum.photos/seed/astro/100",
    likes: 12,
    comments: 5,
  },
  {
    id: 2,
    author: "Thomas Bui",
    content:
      "Đây là một bài đăng dài để kiểm tra khả năng xuống dòng và giữ layout ổn định. Mục tiêu là đảm bảo rằng tất cả các bài đăng trên timeline đều hiển thị đẹp mắt và không bị tràn lề.",
    time: "20m ago",
    avatarUrl: "https://picsum.photos/seed/thomas/100",
    likes: 45,
    comments: 10,
  },
  {
    id: 3,
    author: "Alice Dang",
    content: "Món ăn cuối tuần của tôi! Chúc cả nhà một ngày chủ nhật vui vẻ.",
    time: "1h ago",
    avatarUrl: "https://picsum.photos/seed/alice/100",
    likes: 102,
    comments: 21,
  },
];

// --- 1. Feed Header Component ---
const FeedHeader = () => {
  const theme = useTheme();

  // Giả định nút Edit3 ở đây dùng để tạo bài viết mới
  const handleNewPost = () => {
    alert("Chuyển đến màn hình tạo bài viết mới");
    // Ví dụ: navigation.navigate('NewPost' as never);
  };

  return (
    <XStack items="center" justify="space-between" px="$4" py="$3">
      <Text fontSize="$8" fontWeight="800" color={theme.color}>
        Feed
      </Text>
      <Edit3 size="$1.5" color={theme.color} onPress={handleNewPost} />
    </XStack>
  );
};

// --- 2. Feed Filter Component (Tương tự Filter.tsx) ---
const FeedFilter = () => {
  const theme = useTheme();
  // Giả định 'Feed' là active tab trên màn hình Feed
  const [activeTab, setActiveTab] = useState("Feed");
  const navigation = useNavigation();

  const handleNowPress = () => {
    setActiveTab("Now");
    // Giả định chuyển hướng về màn hình Inbox/NowScreen
    alert("Chuyển về màn hình Now/Inbox");
    // navigation.navigate('Inbox' as never);
  };

  const handleFeedPress = () => {
    setActiveTab("Feed");
  };

  return (
    <XStack width="100%" gap="$2" px={10} py="$2">
      <Button
        flex={1}
        borderRadius={50}
        bg={activeTab === "Now" ? theme.accent4 : theme.static4}
        onPress={handleNowPress}
      >
        <Text color={theme.color1} fontWeight="900" fontSize="$4">
          Now
        </Text>
      </Button>
      <Button
        flex={1}
        borderRadius={50}
        bg={activeTab === "Feed" ? theme.accent4 : theme.static4}
        onPress={handleFeedPress}
      >
        <Text color={theme.color1} fontWeight="900" fontSize="$4">
          Feed
        </Text>
      </Button>
    </XStack>
  );
};

// --- 3. Post List Item Component ---
interface PostItemProps {
  post: (typeof dummyPosts)[0];
}

const PostListItem: React.FC<PostItemProps> = ({ post }) => {
  const theme = useTheme();

  // Icon Button Helper
  const ActionButton = ({ icon: Icon, count, onPress }: any) => (
    <XStack space="$1.5" items="center" cursor="pointer" onPress={onPress}>
      <Icon size="$1" color={theme.color9} />
      <Text fontSize="$3" color={theme.color9}>
        {count}
      </Text>
    </XStack>
  );

  return (
    <YStack px="$4" py="$3" bg={theme.background} space="$3">
      {/* Post Header (Avatar + Name + Time) */}
      <XStack space="$3" items="center">
        <Avatar circular size="$4">
          <Avatar.Image src={post.avatarUrl} />
          <Avatar.Fallback bg={theme.accent1 ?? theme.static2} />
        </Avatar>
        <YStack flex={1}>
          <Text fontWeight="700" color={theme.color} fontSize="$4">
            {post.author}
          </Text>
          <XStack space="$1.5" items="center">
            <Globe size="$1" color={theme.color9} opacity={0.8} />
            <Text color={theme.color9} fontSize="$2" opacity={0.8}>
              {post.time}
            </Text>
          </XStack>
        </YStack>
        <Button size="$2" chromeless iconAfter={Edit3} />{" "}
        {/* More options button */}
      </XStack>

      {/* Post Content */}
      <Text color={theme.color2} fontSize="$4" lineHeight={22}>
        {post.content}
      </Text>

      {/* Post Actions (Likes, Comments, Share) */}
      <XStack
        justify="space-between"
        pt="$2"
        borderTopWidth={1}
        borderColor={theme.static1}
      >
        <ActionButton
          icon={Heart}
          count={post.likes}
          onPress={() => alert(`Liked post ${post.id}`)}
        />
        <ActionButton
          icon={MessageCircle}
          count={post.comments}
          onPress={() => alert(`View comments for post ${post.id}`)}
        />
        <ActionButton
          icon={Share2}
          count={0}
          onPress={() => alert(`Share post ${post.id}`)}
        />
      </XStack>
    </YStack>
  );
};

// --- Main Feed Component ---
const Feed = () => {
  const theme = useTheme();

  return (
    <SafeAreaVieww>
      <YStack flex={1} bg={theme.background}>
        <FeedHeader />
        <FeedFilter />
        <Separator my="$1" borderColor={theme.static1} />

        <ScrollView flex={1}>
          {dummyPosts.map((post) => (
            <YStack key={post.id}>
              <PostListItem post={post} />
              {/* Dùng Separator để phân tách các bài post */}
              <Separator borderColor={theme.static1} />
            </YStack>
          ))}
        </ScrollView>
      </YStack>
    </SafeAreaVieww>
  );
};

export default Feed;
