import {useTheme} from '@/theme';
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text, TextInput} from '@/components/global';
import {MaterialIcons} from '@expo/vector-icons';
import React, {useMemo, useState} from 'react';
import {validateEmail} from '@/utils/auth';
import {useAuth} from '@/contexts/AuthContext';
import type {IThemeColors} from '@/theme/types';

const LoginForm = () => {
  const {login, isLoading} = useAuth();
  const {colors} = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isSecurePassword, setIsSecurePassword] = useState(true);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogin = async () => {
    setErrors({});
    const newErrors: { email?: string; password?: string } = {};
    const trimmedPassword = password.trim();

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!trimmedPassword) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const response = await login(email.trim().toLowerCase(), trimmedPassword);
    if (response.meta.status === 401) {
      console.info('Login failed: Invalid email or password');
      setErrors({
        email: 'Invalid email or password',
        password: 'Invalid email or password',
      });
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          accessibilityLanguage={'en-US'}
          maxLength={50}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Enter your password"
          placeholderTextColor={colors.green}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={isSecurePassword}
          editable={!isLoading}
          accessibilityLanguage={'en-US'}
          autoCapitalize="none"
          maxLength={50}
        />
        <TouchableOpacity
          onPress={() => setIsSecurePassword(!isSecurePassword)}
          style={styles.securePassword}
        >
          <MaterialIcons
            name={isSecurePassword ? 'visibility' : 'visibility-off'}
            size={24}
            color={colors.green900}
          />
        </TouchableOpacity>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff"/>
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;

const createStyles = (colors: IThemeColors) =>
  StyleSheet.create({
    form: {
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.green900,
      marginBottom: 8,
      opacity: 0.8,
    },
    input: {
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      borderWidth: 1,
    },
    inputError: {
      borderColor: '#ff4444',
    },
    errorText: {
      color: '#ff4444',
      fontSize: 12,
      marginTop: 4,
    },
    button: {
      backgroundColor: colors.yellow,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    link: {
      color: colors.yellow,
      fontWeight: 'bold',
    },
    securePassword: {
      position: 'absolute',
      top: 42.5,
      right: 17.5,
    },
  });
