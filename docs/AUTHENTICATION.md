# Authentication System Documentation

This documentation explains how to use the authentication system in the Journee app.

## Overview

The authentication system provides:
- User registration and login
- Secure token storage
- Authentication middleware for route protection
- Beautiful login and register UI
- User context management

## Components

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

The main authentication context that manages user state and authentication logic.

**Features:**
- Login and registration
- Token management (SecureStore + AsyncStorage)
- User state management
- Automatic navigation after auth
- Logout functionality

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
  // Check if user is logged in
  if (!isAuthenticated) {
    return <Text>Please login</Text>;
  }
  
  return (
    <View>
      <Text>Welcome {user?.username}</Text>
      <Button onPress={logout} title="Logout" />
    </View>
  );
}
```

### 2. Auth Middleware (`src/middleware/authMiddleware.tsx`)

Protects routes and handles automatic navigation.

**How it works:**
- Redirects unauthenticated users to `/login`
- Redirects authenticated users from auth pages to `/(tabs)`
- Already integrated in `_layout.tsx`

### 3. Login Screen (`src/app/login.tsx`)

Beautiful login UI with validation.

**Features:**
- Email and password validation
- Error handling
- Loading states
- Link to registration

### 4. Register Screen (`src/app/register.tsx`)

Beautiful registration UI with comprehensive validation.

**Features:**
- Email, username, password validation
- Password confirmation
- Optional first name and last name
- Error handling
- Loading states
- Link to login

### 5. Auth Utilities (`src/utils/auth.ts`)

Helper functions for authentication.

**Functions:**
- `getAuthToken()` - Get current auth token
- `isAuthenticated()` - Check if user is authenticated
- `getUserData()` - Get stored user data
- `clearAuthData()` - Clear all auth data
- `validateEmail()` - Validate email format
- `validatePassword()` - Validate password strength
- `validateUsername()` - Validate username format

### 6. Auth Components (`src/components/auth/AuthComponents.tsx`)

Reusable authentication components.

**Components:**
- `LogoutButton` - Customizable logout button
- `UserInfo` - Display user information

**Usage:**
```tsx
import { LogoutButton, UserInfo } from '@/components/auth/AuthComponents';

function ProfileScreen() {
  return (
    <View>
      <UserInfo />
      <LogoutButton variant="primary" />
    </View>
  );
}
```

## API Integration

The authentication system expects the following API endpoints:

### Login
**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Register
**Endpoint:** `POST /api/users/`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Token Storage

Tokens are stored in multiple locations for reliability:
- **SecureStore:** Primary secure storage for auth token
- **AsyncStorage:** Backup storage and background service access
  - `authToken`
  - `backgroundAuthToken`
  - `userToken`

## Using Auth in Your Screens

### Example 1: Protected Screen

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyProtectedScreen() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return null; // Middleware will redirect
  }
  
  return (
    <View>
      <Text>Welcome {user?.username}</Text>
    </View>
  );
}
```

### Example 2: Conditional Rendering

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyScreen() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <View>
      {isAuthenticated ? (
        <Text>Hello {user?.username}</Text>
      ) : (
        <Text>Please login</Text>
      )}
    </View>
  );
}
```

### Example 3: Manual Login

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

function CustomLoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      // User will be redirected automatically
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button onPress={handleLogin} disabled={isLoading} title="Login" />
    </View>
  );
}
```

## Validation Rules

### Email
- Must be a valid email format
- Example: `user@example.com`

### Password
- Minimum 6 characters
- No specific complexity requirements (can be customized)

### Username
- Minimum 3 characters
- Only letters, numbers, and underscores allowed
- Pattern: `/^[a-zA-Z0-9_]+$/`

## Customization

### Change API URL

Update the `EXPO_PUBLIC_API_URL` environment variable or modify the default in `AuthContext.tsx`:

```tsx
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://your-api-url.com";
```

### Customize Theme

The login and register screens use the `useTheme()` hook from `@/theme`. Modify colors in `src/theme/colors.ts`:

```tsx
export const lightColors: IThemeColors = {
  text: '#1c0f08',
  background: '#efeae7',
  primary: '#ff7424',
  secondary: '#663800',
  accent: '#ffc824',
}
```

### Add More Validation

Extend the validation functions in `src/utils/auth.ts`:

```tsx
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter' };
  }
  return { valid: true };
};
```

## Troubleshooting

### User not redirected after login
- Check that `AuthProvider` is wrapping your app in `_layout.tsx`
- Verify that `useAuthMiddleware()` is being called

### Token not persisting
- Ensure SecureStore is available (it works on iOS and Android, not web)
- Check AsyncStorage fallback is working

### Axios requests not authenticated
- The token is automatically set in axios headers after login
- For custom axios instances, use `getAuthToken()` from utils

## Security Notes

1. **Never store sensitive data in AsyncStorage** - Use SecureStore for tokens
2. **Always use HTTPS** - Ensure your API uses HTTPS in production
3. **Token expiration** - Implement token refresh logic if your backend uses refresh tokens
4. **Secure password transmission** - Passwords are sent over HTTPS (ensure this in production)

## Next Steps

1. Implement password reset functionality
2. Add social authentication (Google, Apple, etc.)
3. Implement token refresh logic
4. Add biometric authentication
5. Add email verification flow
