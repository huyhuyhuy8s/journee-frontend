import {useAuth} from "@/contexts/AuthContext";
import React, {useMemo, useState} from "react";
import {validateEmail, validatePassword, validateUsername} from "@/utils/auth";
import {router} from "expo-router";
import {ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View} from "react-native";
import {Text, TextInput} from "@/components/global";
import {MaterialIcons} from "@expo/vector-icons/";
import {useTheme} from "@/theme";

const RegisterForm = () => {
  const {register, isLoading} = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  }>({});

  const [isSecurePassword, setIsSecurePassword] = useState(true);

  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleRegister = async () => {
    setErrors({});

    const newErrors: any = {};

    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.valid) {
        newErrors.username = usernameValidation.message;
      }
    }

    if (!trimmedPassword) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(trimmedPassword);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (!trimmedConfirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (trimmedPassword !== trimmedConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(
        formData.username.trim(),
        formData.email.trim().toLowerCase(),
        trimmedPassword,
      );
      router.replace('/login')
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email <Text style={styles.labelHighlight}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          maxLength={50}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username <Text style={styles.labelHighlight}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder="Choose a username"
          value={formData.username}
          onChangeText={(value) => handleChange('username', value)}
          autoCapitalize="words"
          editable={!isLoading}
          maxLength={50}
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password <Text style={styles.labelHighlight}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Create a password"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry={isSecurePassword}
          editable={!isLoading}
          autoCapitalize='none'
          maxLength={50}
        />
        <MaterialIcons name={isSecurePassword ? 'visibility' : 'visibility-off'} size={24} color={colors.text}
                       onPress={() => setIsSecurePassword(!isSecurePassword)}
                       style={styles.securePassword}/>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password <Text style={styles.labelHighlight}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          secureTextEntry={isSecurePassword}
          autoCapitalize='none'
          editable={!isLoading}
          maxLength={50}
        />
        <MaterialIcons name={isSecurePassword ? 'visibility' : 'visibility-off'} size={24} color={colors.text}
                       onPress={() => setIsSecurePassword(!isSecurePassword)}
                       style={styles.securePassword}/>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff"/>
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default RegisterForm;

const createStyles = (colors: any) => StyleSheet.create({
  form: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  labelHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
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
    backgroundColor: colors.primary,
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
  securePassword: {
    position: 'absolute',
    top: 42.5,
    right: 17.5,
  },
})