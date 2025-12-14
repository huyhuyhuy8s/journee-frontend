import {
  Text,
  XStack,
  YStack,
  useTheme,
  Avatar,
  ScrollView,
  Input,
  Button,
  Image,
} from "tamagui";
import {
  ArrowLeft,
  MoreVertical,
  Plus,
  Send, // Biểu tượng gửi
  Image as ImageIcon, // Biểu tượng ảnh (Lucide Icon)
  Camera, // Biểu tượng camera (Lucide Icon)
} from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import SafeAreaVieww from "@/src/components/SafeAreaVieww";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

// --- Dữ liệu Mẫu ---
const AVATAR_URL_DEFAULT = "https://picsum.photos/seed/default/100";

const dummyMessages = [
  // Giữ nguyên dummyMessages
  {
    id: 1,
    sender: "Thomas Bui",
    text: "Yo",
    type: "text",
    isUser: false,
    avatar: "https://picsum.photos/seed/thomas/100",
  },
  {
    id: 2,
    sender: "Thomas Bui",
    text: "I send you this for designing purpose only ",
    type: "text",
    isUser: false,
    avatar: "https://picsum.photos/seed/thomas/100",
  },
  {
    id: 3,
    sender: "Thomas Bui",
    text: "And I am not alone",
    type: "text",
    isUser: false,
    avatar: "https://picsum.photos/seed/thomas/100",
  },
  {
    id: 4,
    sender: "Thomas Bui",
    text: "Have a great day!",
    type: "text",
    isUser: false,
    avatar: "https://picsum.photos/seed/thomas/100",
  },
  {
    id: 5,
    sender: "User",
    text: "Yo",
    type: "text",
    isUser: true,
  },
  {
    id: 6,
    sender: "User",
    text: "Image of beautiful coast",
    type: "image",
    imageUrl: "https://picsum.photos/seed/coast1/400/300",
    isUser: true,
  },
  {
    id: 7,
    sender: "User",
    text: "Image of green hills",
    type: "image",
    imageUrl: "https://picsum.photos/seed/coast2/400/300",
    isUser: true,
  },
  {
    id: 8,
    sender: "Thomas Bui",
    text: "Another one!",
    type: "text",
    isUser: false,
  },
  {
    id: 9,
    sender: "User",
    text: "nothing",
    type: "text",
    isUser: true,
  },
];

// --- 1. Chat Bubble Component ---
interface ChatBubbleProps {
  message: (typeof dummyMessages)[0];
  otherUserAvatar: string;
  hideAvatar: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  otherUserAvatar,
  hideAvatar, // Nhận prop mới
}) => {
  const theme = useTheme();
  const userBg = theme.static3;
  const otherBg = theme.static4;
  const textColorUser = theme.color7;
  const textotherColorUser = theme.color2;
  return (
    <XStack
      py="$1"
      px="$4"
      justify={message.isUser ? "flex-end" : "flex-start"}
      space="$2"
      items="flex-end"
    >
      {!message.isUser ? (
        <YStack width="$3">
          {!hideAvatar && ( // Chỉ render Avatar nếu KHÔNG ẩn
            <Avatar circular size="$3">
              <Avatar.Image src={otherUserAvatar} />
              <Avatar.Fallback bg={theme.accent11 ?? theme.static2} />
            </Avatar>
          )}
        </YStack>
      ) : null}

      {/* Bubble Content */}
      <YStack
        maxWidth="80%"
        bg={message.isUser ? userBg : otherBg}
        borderRadius="$4"
        borderBottomLeftRadius={message.isUser ? "$4" : "$1"}
        borderBottomRightRadius={message.isUser ? "$1" : "$4"}
        p={message.type === "text" ? "$2.5" : "$1"}
      >
        {message.type === "text" ? (
          <Text
            color={message.isUser ? textColorUser : textotherColorUser}
            fontSize="$4"
          >
            {message.text}
          </Text>
        ) : (
          <YStack>
            <Image
              source={{ uri: message.imageUrl }}
              width={200}
              height={150}
              borderRadius="$3"
              overflow="hidden"
            />
          </YStack>
        )}
      </YStack>
    </XStack>
  );
};

// --- 2. User Profile Header (Thomas Bui) ---
const ChatProfileHeader = ({
  userName,
  userAvatar,
}: {
  userName: string;
  userAvatar: string;
}) => {
  const theme = useTheme();
  const profileAvatarUrl = userAvatar
    ? userAvatar.replace("/100", "/200")
    : AVATAR_URL_DEFAULT;

  return (
    <YStack p="$4" items="center">
      <Avatar circular size="$10">
        <Avatar.Image src={profileAvatarUrl} />
        <Avatar.Fallback bg={theme.accent1 ?? theme.static2} />
      </Avatar>
      <Text fontSize="$7" fontWeight="900" color={theme.accent11} mt="$2">
        {userName}
      </Text>
      <XStack pb={"$5"} mt="$1" space="$1"></XStack>
    </YStack>
  );
};

// --- 3. Message Input Area ---
const MessageInputArea = () => {
  const theme = useTheme();
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [message, setMessage] = useState("");

  const toggleAttachmentMenu = () => {
    setIsAttachmentMenuOpen(!isAttachmentMenuOpen);
  };

  // CHỨC NĂNG 1: CHỌN ẢNH TỪ THƯ VIỆN
  const handleImageSend = async () => {
    setIsAttachmentMenuOpen(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Rất tiếc, chúng tôi cần quyền truy cập thư viện ảnh để gửi hình!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      alert(
        `Đã chọn ảnh thành công. URI: ${imageUri} \n(Thực hiện gửi ảnh...)`
      );
    }
  };

  // CHỨC NĂNG 2: TRUY CẬP CAMERA
  const handleCameraAccess = async () => {
    setIsAttachmentMenuOpen(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Rất tiếc, chúng tôi cần quyền truy cập Camera để chụp ảnh!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      alert(
        `Đã chụp ảnh thành công. URI: ${imageUri} \n(Thực hiện gửi ảnh...)`
      );
    }
  };

  // Hàm xử lý gửi tin nhắn (text)
  const handleSend = () => {
    if (message.trim()) {
      alert(`Gửi tin nhắn: "${message.trim()}"`);
      setMessage(""); // Xóa nội dung input sau khi gửi
    }
  };

  return (
    <YStack>
      {isAttachmentMenuOpen && (
        <XStack px="$4" py="$2" space="$3" bg={theme.static3} items="center">
          <Button
            size="$4"
            circular
            bg={theme.blue9}
            onPress={handleImageSend} // Gắn hàm chọn ảnh từ Thư viện
            icon={<ImageIcon size="$1.5" color={theme.background} />}
            aria-label="Upload Image"
          />
          <Button
            size="$4"
            circular
            bg={theme.red9}
            onPress={handleCameraAccess} // Gắn hàm Truy cập Camera
            icon={<Camera size="$1.5" color={theme.background} />}
            aria-label="Access Camera"
          />
          <Text color={theme.color} fontSize="$4" ml="$2">
            Chọn để gửi đính kèm
          </Text>
        </XStack>
      )}

      {/* Thanh Input chính */}
      <XStack
        items="center"
        space="$2"
        px="$4"
        py="$3"
        bg={theme.background}
        borderTopWidth={1}
        borderColor={theme.static1}
      >
        <Button
          size="$4"
          circular
          bg={theme.static4}
          onPress={toggleAttachmentMenu}
          icon={<Plus size="$1" color={theme.color2} />}
          aria-label="Toggle Attachment Menu"
        />

        {/* Thanh Input */}
        <Input
          flex={1}
          placeholder="Send a message"
          placeholderTextColor={theme.color2}
          borderWidth={0}
          borderRadius="$6"
          bg={theme.static4}
          px="$3"
          py="$3"
          fontSize="$4"
          color={theme.color2}
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
        />

        {/* Nút Gửi (Send) */}
        <Button
          size="$4"
          circular
          bg={theme.color2}
          onPress={handleSend}
          icon={<Send size="$1" color={theme.color8} />}
          disabled={!message.trim()}
          aria-label="Send Message"
        />
      </XStack>
    </YStack>
  );
};

// --- Main Chat Component ---
const ChatScreen = () => {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();

  const { userName, userAvatar } = (route.params as {
    userName: string;
    userAvatar: string;
  }) || { userName: "Thomas Bui", userAvatar: AVATAR_URL_DEFAULT };

  const keyboardVerticalOffset = 0;

  return (
    <SafeAreaVieww>
      {/* KEYBOARDAVOIDINGVIEW ĐỂ XỬ LÝ BÀN PHÍM */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <YStack flex={1} bg={theme.background}>
          {/* Chat Header (Trên cùng) */}
          <XStack items="center" justify="space-between" px="$4" py="$2">
            <XStack items="center" space="$2">
              {/* Nút Quay lại */}
              <ArrowLeft
                size="$1.5"
                color={theme.color2}
                onPress={() => navigation.goBack()}
              />
              <Avatar circular size="$3">
                <Avatar.Image src={userAvatar} />
                <Avatar.Fallback bg={theme.accent1 ?? theme.static2} />
              </Avatar>
              <Text fontSize="$4" fontWeight="800" color={theme.color2}>
                {userName}
              </Text>
            </XStack>
            <MoreVertical size="$1.5" color={theme.color} />
          </XStack>

          {/* Nội dung Chat */}
          <ScrollView flex={1} contentContainerStyle={{ pb: 10 }}>
            {/* Profile Header hiển thị ở đầu chat */}
            <ChatProfileHeader userName={userName} userAvatar={userAvatar} />

            {dummyMessages.map((msg, index) => {
              const previousMessage = dummyMessages[index - 1];
              const hideAvatar =
                !msg.isUser && index > 0 && !previousMessage.isUser;

              return (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  otherUserAvatar={userAvatar}
                  hideAvatar={hideAvatar} //
                />
              );
            })}
          </ScrollView>
          {/* Message Input */}
          <MessageInputArea />
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaVieww>
  );
};

export default ChatScreen;
