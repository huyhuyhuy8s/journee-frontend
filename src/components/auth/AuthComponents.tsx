import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/theme';

interface LogoutButtonProps {
  style?: any;
  textStyle?: any;
  variant?: 'primary' | 'secondary' | 'text';
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  style, 
  textStyle,
  variant = 'primary' 
}) => {
  const { logout, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ],
      { cancelable: true }
    );
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#ff4444',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center' as const,
        };
      case 'secondary':
        return {
          backgroundColor: isDark ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 68, 68, 0.1)',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center' as const,
          borderWidth: 1,
          borderColor: '#ff4444',
        };
      case 'text':
        return {
          padding: 8,
        };
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return { color: '#ffffff', fontWeight: '600' as const, fontSize: 16 };
      case 'secondary':
      case 'text':
        return { color: '#ff4444', fontWeight: '600' as const, fontSize: 16 };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handleLogout}
      disabled={isLoading}
    >
      <Text style={[getTextStyle(), textStyle]}>
        {isLoading ? 'Logging out...' : 'Logout'}
      </Text>
    </TouchableOpacity>
  );
};

export const UserInfo: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();

  if (!user) return null;

  return (
    <View style={styles.userInfoContainer}>
      <Text style={[styles.username, { color: colors.text }]}>
        {user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username}
      </Text>
      <Text style={[styles.email, { color: colors.text, opacity: 0.7 }]}>
        {user.email}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  userInfoContainer: {
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
});
