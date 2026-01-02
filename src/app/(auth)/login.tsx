import React, {useMemo} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Link} from 'expo-router';
import {useTheme} from '@/theme';
import {MaterialIcons} from '@expo/vector-icons/';
import {SafeAreaView, Text} from '@/components/global';
import LoginForm from '@/features/auth/components/LoginForm';
import type {IThemeColors} from '@/theme/types';

const Login = () => {
  const {colors} = useTheme();
  const styles = useMemo(() => creatStyles(colors), [colors]);

  const SignUpLink = () => {
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={styles.link}>
            Sign Up
          </Link>
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyAvoidView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <MaterialIcons
              name="share-location"
              size={128}
              color={colors.primary}
            />
          </View>

          <LoginForm/>

          <SignUpLink/>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const creatStyles = (colors: IThemeColors) =>
  StyleSheet.create({
    keyAvoidView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      marginBottom: 48,
      alignItems: 'center',
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      fontFamily: 'Whyte',
    },
    subtitle: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.7,
    },
    link: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    footer: {
      alignItems: 'center',
      marginTop: 24,
    },
    footerText: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
    },
  });
