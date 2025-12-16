import React, {useMemo} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View,} from 'react-native';
import {Link} from 'expo-router';
import {useTheme} from '@/theme';
import {MaterialIcons} from "@expo/vector-icons";
import {SafeAreaView, Text} from '@/components/global'
import RegisterForm from "@/features/auth/components/RegisterForm";
import {IThemeColors} from "@/theme/types";

const Register = () => {
  const {colors} = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <MaterialIcons name='share-location' size={128} color={colors.primary}/>
          </View>

          <RegisterForm/>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Link href="/login" style={styles.link}>
                Sign In
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

const createStyles = (colors: IThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 32,
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
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  link: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});