import React, { useState } from "react";
import {
  Text,
  XStack,
  YStack,
  useTheme,
  Avatar,
  Input,
  Button,
  TextArea,
  Separator,
  ScrollView,
} from "tamagui";
import {
  X, // Nút Đóng
  FileText, // Biểu tượng File
  Camera, // Biểu tượng Camera
  Image, // Biểu tượng Ảnh
  Maximize, // Biểu tượng Tệp/File (Giống trong ảnh)
  Smile, // Biểu tượng Emoticon
  Clipboard, // Biểu tượng Drafts/Lưu
  MoreHorizontal, // Biểu tượng More
  ArrowRight, // Biểu tượng Topic/Tiêu đề
} from "@tamagui/lucide-icons";
import SafeAreaVieww from "@/src/components/SafeAreaVieww";
import { useNavigation } from "@react-navigation/native";

// --- Dữ liệu Mẫu ---
const USER_NAME = "Astro Lovar";
const USER_AVATAR = "https://picsum.photos/seed/astro/100";

// --- 1. Header Component ---
const NewPostHeader = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  // Xử lý đóng màn hình
  const handleClose = () => {
    // Chuyển về màn hình trước đó
    navigation.goBack();
  };

  // Xử lý lưu nháp
  const handleDrafts = () => {
    alert("Lưu nháp/Drafts");
  };

  // Xử lý tùy chọn khác
  const handleMore = () => {
    alert("Tùy chọn khác");
  };

  return (
    <XStack
      items="center"
      justify="space-between"
      px="$4"
      py="$3"
      borderBottomWidth={1}
      borderColor={theme.static1}
    >
      {/* Nút Đóng (X) */}
      <X size="$1.5" color={theme.static1} onPress={handleClose} />

      {/* Tiêu đề */}
      <Text fontSize="$6" fontWeight="900" color={theme.primary}>
        New post
      </Text>

      {/* Nút Chức năng (Drafts và More) */}
      <XStack space="$3">
        <Clipboard size="$1.5" color={theme.static1} onPress={handleDrafts} />
        <MoreHorizontal
          size="$1.5"
          color={theme.static1}
          onPress={handleMore}
        />
      </XStack>
    </XStack>
  );
};

// --- 2. User Info & Topic Bar (ĐÃ SỬA CĂN CHỈNH) ---
const UserInfoTopicBar = () => {
  const theme = useTheme();

  return (
    <XStack px="$4" py="$3" space="$3" items="flex-start">
      {/* Avatar */}
      <Avatar circular size="$6">
        <Avatar.Image src={USER_AVATAR} />
        <Avatar.Fallback bg={theme.static1 ?? theme.static2} />
      </Avatar>

      <XStack items="center" space="$2">
        {" "}
        {/* XStack ngoài */}
        {/* Tên người dùng */}
        <Text fontWeight="bold" color={theme.color1} fontSize="$5">
          {USER_NAME}
        </Text>
        <XStack items="center" space="$1" cursor="pointer">
          {" "}
          {/* XStack chứa Topic */}
          <ArrowRight size="$1" color={theme.static1} />
          <Text color={theme.static1} fontSize="$3">
            Add a new topic
          </Text>
        </XStack>
      </XStack>
    </XStack>
  );
};

// --- 3. Attachment Bar Component (Thanh công cụ đính kèm) ---
const AttachmentBar = () => {
  const theme = useTheme();

  // Giả định các hàm xử lý đính kèm
  const handleAttachment = (type: string) => {
    alert(`Mở tính năng: ${type}`);
  };

  return (
    <XStack py="$2" space="$1" items="center">
      {/* Image Gallery */}
      <Button
        chromeless
        p="$1.5"
        icon={<Image size="$1.5" color={theme.static1} />}
        onPress={() => handleAttachment("Gallery")}
      />
      {/* Video/Clipboard (Icon gần giống trong ảnh) */}
      <Button
        chromeless
        p="$1.5"
        icon={<Maximize size="$1.5" color={theme.static1} />}
        onPress={() => handleAttachment("Video")}
      />
      {/* Camera */}
      <Button
        chromeless
        p="$1.5"
        icon={<Camera size="$1.5" color={theme.static1} />}
        onPress={() => handleAttachment("Camera")}
      />
      {/* File/Document */}
      <Button
        chromeless
        p="$1.5"
        icon={<FileText size="$1.5" color={theme.static1} />}
        onPress={() => handleAttachment("File")}
      />
      {/* Emoticon */}
      <Button
        chromeless
        p="$1.5"
        icon={<Smile size="$1.5" color={theme.static1} />}
        onPress={() => handleAttachment("Emoticon")}
      />
      {/* Nút ... More (Nếu cần) */}
      <Button
        chromeless
        p="$1.5"
        icon={<MoreHorizontal size="$1.5" color={theme.static1} />} // Dùng static1 cho nhất quán
        onPress={() => handleAttachment("More")}
      />
    </XStack>
  );
};

// --- 4. Footer & Done Button ---
const NewPostFooter = () => {
  const theme = useTheme();
  const [statusText, setStatusText] = useState("Friends can view your status");

  const handleDone = () => {
    alert("Đã đăng bài!");
    // Thường là navigation.goBack();
  };

  const handleStatusChange = () => {
    alert("Mở tùy chọn quyền riêng tư");
    // Ví dụ: Mở modal chọn quyền riêng tư
  };

  return (
    <YStack borderTopWidth={1} borderColor={theme.static1} pt="$3">
      <XStack justify="space-between" items="center" px="$4" pb="$3">
        {/* Trạng thái/Quyền riêng tư */}
        <Text
          color={theme.static1}
          fontSize="$3"
          cursor="pointer"
          onPress={handleStatusChange}
        >
          {statusText}
        </Text>

        {/* Nút Done */}
        <Button
          size="$4"
          borderRadius="$8"
          bg={theme.accent7}
          onPress={handleDone}
        >
          <Text color={theme.background} fontWeight="900" fontSize="$4">
            Done
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
};

// --- Main NewPost Component (ĐÃ SỬA CẤU TRÚC) ---
const NewPost = () => {
  const theme = useTheme();
  const [postContent, setPostContent] = useState("");
  const [textHeight, setTextHeight] = useState(150); // minimum height for TextArea

  return (
    <SafeAreaVieww>
      <YStack flex={1} bg={theme.background}>
        <NewPostHeader />

        {/* ScrollView contains avatar + name + "What's new?" + AttachmentBar so they're in one area and scroll together */}
        <ScrollView flex={1}>
          <XStack px="$4" py="$3" space="$3" items="flex-start">
            {/* Avatar */}
            <Avatar circular size="$6">
              <Avatar.Image src={USER_AVATAR} />
              <Avatar.Fallback bg={theme.static1 ?? theme.static2} />
            </Avatar>

            {/* Right column: Name, topic, textarea, attachment bar */}
            <YStack flex={1} items="flex-start">
              {/* Name + topic row */}
              <XStack items="center" space="$1.5" mb="$1">
                <Text fontWeight="900" color={theme.color1} fontSize="$5">
                  {USER_NAME}
                </Text>
                <XStack items="center" space="$1" cursor="pointer">
                  <ArrowRight size="$1" color={theme.static1} />
                  <Text color={theme.static1} fontSize="$3">
                    Add a new topic
                  </Text>
                </XStack>
              </XStack>

              {/* "What's new?" textarea placed directly under the username and left-aligned with it */}
              <TextArea
                width="100%"
                flex={0}
                placeholder="What's new?"
                placeholderTextColor={theme.static1}
                borderWidth={0}
                bg="transparent"
                fontSize="$5"
                color={theme.color1}
                value={postContent}
                onChangeText={setPostContent}
                textAlignVertical="top"
                onContentSizeChange={(e: any) => {
                  const MIN_HEIGHT = 80;
                  const h = e?.nativeEvent?.contentSize?.height ?? MIN_HEIGHT;
                  setTextHeight(Math.max(MIN_HEIGHT, h));
                }}
                style={{
                  height: textHeight,
                  width: "100%",
                  paddingVertical: 0,
                }}
              />

              {/* AttachmentBar under the TextArea so it moves down when textarea grows */}
              <AttachmentBar />
            </YStack>
          </XStack>
        </ScrollView>

        {/* Footer remains fixed at bottom */}
        <NewPostFooter />
      </YStack>
    </SafeAreaVieww>
  );
};

export default NewPost;
