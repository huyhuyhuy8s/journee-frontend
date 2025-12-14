import React, { useState } from "react";
import {
  Text,
  useTheme,
  XStack,
  YStack,
  Button,
  Input,
  Avatar,
  Separator,
  Square,
} from "tamagui";
import SafeAreaVieww from "@/src/components/SafeAreaVieww";
import { ArrowLeft, Camera, User, Mail, Lock } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Platform, Alert } from "react-native";
import { useThemeValue } from "@/src/contexts/ThemeContext";

// Dữ liệu giả định người dùng hiện tại
const initialUser = {
  name: "Thomas Bui",
  email: "thomas.bui@example.com",
  avatarUri: "https://picsum.photos/seed/thomas_update/150",
};

// --- 1. Custom Header Component ---
const UpdateInfoHeader = () => {
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
        Update Info
      </Text>
      <Square size={20} /> {/* Giữ khoảng trống để căn giữa tiêu đề */}
    </XStack>
  );
};

// --- 2. Avatar Picker Component ---
interface AvatarPickerProps {
  avatarUri?: string | null;
  onAvatarChange: (uri: string) => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  avatarUri,
  onAvatarChange,
}) => {
  const theme = useTheme();

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh để đặt avatar mới."
        );
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onAvatarChange(result.assets[0].uri);
    }
  };

  return (
    <YStack items="center" py="$5">
      <Button
        onPress={pickImage}
        chromeless
        p={0}
        size="$10"
        borderRadius="$12"
        position="relative"
      >
        <Avatar circular size="$10">
          <Avatar.Image src={avatarUri ?? undefined} />
          <Avatar.Fallback bg={theme.background} />
        </Avatar>

        {/* Icon camera - Bỏ màu nền khi nhấn */}
        <XStack
          position="absolute"
          b={-5}
          r={-5}
          bg={theme.static6}
          p="$2"
          borderRadius="$10"
          borderWidth={2}
          borderColor={theme.background}
        >
          <Camera size={20} color={theme.background} />
        </XStack>
      </Button>
    </YStack>
  );
};

// --- Main Update Info Component ---
const UpdateInfo = () => {
  const theme = useTheme();
  const themeValue = useThemeValue();
  const [, setTick] = React.useState(0);

  const [user, setUser] = useState(initialUser);
  const [formData, setFormData] = useState({
    name: initialUser.name,
    email: initialUser.email,
  });
  // Thêm state cho mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  //  hàm xử lý input mật khẩu
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // 1. Logic Cập nhật Thông tin (Name, Email)
    console.log("Saving data:", formData);
    setUser((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
    }));

    // 2. Logic Cập nhật Mật khẩu (Nếu có)
    if (
      passwordData.currentPassword ||
      passwordData.newPassword ||
      passwordData.confirmPassword
    ) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu mới và Xác nhận mật khẩu không khớp.");
        return;
      }
      if (passwordData.newPassword.length < 6) {
        // Thêm validation cơ bản
        Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
      }

      // Gửi request đổi mật khẩu...
      console.log("Updating password:", {
        current: passwordData.currentPassword,
        new: passwordData.newPassword,
      });

      // Reset form mật khẩu sau khi thành công (giả định)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      Alert.alert("Success", "Thông tin và Mật khẩu đã được cập nhật!");
    } else {
      Alert.alert(
        "Success",
        "Thông tin (Name/Email) đã được cập nhật thành công!"
      );
    }
  };

  const handleAvatarChange = (newUri: string) => {
    setUser((prev) => ({ ...prev, avatarUri: newUri }));
    console.log("New Avatar URI:", newUri);
    Alert.alert("Avatar Changed", "Avatar đã được thay đổi. Nhấn Save để lưu.");
  };

  return (
    <SafeAreaVieww>
      <YStack flex={1} bg={theme.background}>
        <UpdateInfoHeader />

        {/* Khu vực Avatar */}
        <AvatarPicker
          avatarUri={user.avatarUri}
          onAvatarChange={handleAvatarChange}
        />

        {/* Form Cập nhật */}
        <YStack px="$4" space="$4">
          {/* --------------------- FORM THÔNG TIN --------------------- */}
          {/* Input Name */}
          <YStack>
            <Text color={theme.color1} fontSize="$5" mb="$1">
              Name
            </Text>
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              icon={<User size={20} color={theme.color10} />}
              bg={theme.static4}
              color={theme.static15}
              placeholderTextColor={theme.static15}
              borderColor={theme.static7}
            />
          </YStack>

          {/* Input Email */}
          <YStack>
            <Text color={theme.color1} fontSize="$5" mb="$1">
              Email
            </Text>
            <Input
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              icon={<Mail size={20} color={theme.color10} />}
              bg={theme.static4}
              color={theme.static15}
              placeholderTextColor={theme.static15}
              borderColor={theme.static7}
            />
          </YStack>

          <Separator marginVertical="$2" borderColor={theme.static4} />

          {/* --------------------- FORM MẬT KHẨU --------------------- */}
          <Text color={theme.color1} fontSize="$5" fontWeight="bold" mb="$-2">
            Change Password
          </Text>

          {/* Mật khẩu cũ */}
          <YStack>
            <Input
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChangeText={(text) =>
                handlePasswordChange("currentPassword", text)
              }
              icon={<Lock size={20} color={theme.color10} />}
              bg={theme.static4}
              secureTextEntry={true}
              color={theme.static15}
              placeholderTextColor={theme.static15}
              borderColor={theme.static7}
            />
          </YStack>

          {/* Mật khẩu mới */}
          <YStack>
            <Input
              placeholder="New Password (min 6 characters)"
              value={passwordData.newPassword}
              onChangeText={(text) => handlePasswordChange("newPassword", text)}
              icon={<Lock size={20} color={theme.color10} />}
              bg={theme.static4}
              secureTextEntry={true}
              color={theme.static15}
              placeholderTextColor={theme.static15}
              borderColor={theme.static7}
            />
          </YStack>

          {/* Xác nhận mật khẩu mới */}
          <YStack>
            <Input
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChangeText={(text) =>
                handlePasswordChange("confirmPassword", text)
              }
              icon={<Lock size={20} color={theme.color10} />}
              bg={theme.static4}
              secureTextEntry={true}
              color={theme.static15}
              placeholderTextColor={theme.static15}
              borderColor={theme.static7}
            />
          </YStack>

          {/* Nút Save */}
          <Button
            onPress={handleSave}
            bg={theme.accent}
            color={theme.background}
            mt="$5"
            height="$6"
            fontWeight="bold"
          >
            Save Changes
          </Button>
        </YStack>
      </YStack>
    </SafeAreaVieww>
  );
};

export default UpdateInfo;
