# Authentication System - Quick Start Guide

## ✅ What Has Been Created

### 1. **Authentication Context** (`src/contexts/AuthContext.tsx`)
- Full authentication state management
- Login, register, and logout functionality
- Secure token storage (SecureStore + AsyncStorage)
- Automatic axios header management
- User data persistence

### 2. **User Context** (`src/contexts/UserContext.tsx`)
- User profile management
- Profile update functionality
- Easy access to current user data

### 3. **Auth Utilities** (`src/utils/auth.ts`)
- Email validation
- Password validation (min 6 characters)
- Username validation (min 3 characters, alphanumeric + underscores)
- Token management helpers
- Authentication state helpers

### 4. **Auth Middleware** (`src/middleware/authMiddleware.tsx`)
- Automatic route protection
- Redirects unauthenticated users to login
- Redirects authenticated users to main app
- Already integrated in `_layout.tsx`

### 5. **Beautiful UI Screens**

#### Login Screen (`src/app/login.tsx`)
- Modern, clean design
- Email and password fields
- Validation with error messages
- Loading states
- Link to registration
- Theme-aware (dark/light mode)

#### Register Screen (`src/app/register.tsx`)
- Comprehensive registration form
- Email, username, password fields
- Optional first name and last name
- Password confirmation
- Validation with inline error messages
- Loading states
- Link to login
- Theme-aware (dark/light mode)

### 6. **Reusable Components** (`src/components/auth/AuthComponents.tsx`)
- `LogoutButton` - Customizable logout button with confirmation
- `UserInfo` - Display user information

### 7. **Updated Files**
- `src/app/_layout.tsx` - Integrated AuthProvider and middleware
- `src/app/(tabs)/user.tsx` - Example profile screen using auth

## 🚀 How to Use

### Basic Usage

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
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

### Login Example

```tsx
const { login, isLoading } = useAuth();

const handleLogin = async () => {
  try {
    await login('user@example.com', 'password123');
    // User is automatically redirected to main app
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Register Example

```tsx
const { register, isLoading } = useAuth();

const handleRegister = async () => {
  try {
    await register(
      'user@example.com',
      'password123',
      'username',
      'John',  // optional
      'Doe'    // optional
    );
    // User is automatically redirected to main app
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Using Auth Components

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

## 🔒 Security Features

1. **Secure Token Storage**
   - Primary: SecureStore (encrypted)
   - Fallback: AsyncStorage (for background services)

2. **Multiple Storage Locations**
   - Ensures tokens are available for background services
   - Automatic cleanup on logout

3. **Automatic Axios Configuration**
   - Auth token automatically added to all requests
   - Cleaned up on logout

4. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Username format requirements

## 🎨 UI Features

- **Theme Support**: Both screens adapt to dark/light mode
- **Error Handling**: Inline validation errors
- **Loading States**: Visual feedback during async operations
- **Responsive Design**: Works on all screen sizes
- **Keyboard Aware**: Smooth keyboard handling
- **Accessibility**: Proper text inputs and labels

## 📋 API Requirements

Your backend should provide these endpoints:

### Login: `POST /api/users/login`
```json
Request: { "email": "user@example.com", "password": "password123" }
Response: { "token": "jwt_token", "user": { "_id": "...", "email": "...", "username": "..." } }
```

### Register: `POST /api/users/`
```json
Request: { "email": "...", "password": "...", "username": "...", "firstName": "...", "lastName": "..." }
Response: { "token": "jwt_token", "user": { "_id": "...", "email": "...", "username": "..." } }
```

## 🔧 Configuration

### Change API URL
Set the `EXPO_PUBLIC_API_URL` environment variable or update `AuthContext.tsx`:
```tsx
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://your-api.com";
```

### Customize Validation
Modify functions in `src/utils/auth.ts`:
```tsx
export const validatePassword = (password: string) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  // Add more rules...
  return { valid: true };
};
```

## 📖 Testing the System

1. **Start your app**: `npm start` or `expo start`
2. **You'll be redirected to login** (due to auth middleware)
3. **Try the register screen** - Create an account
4. **You'll be automatically logged in** and redirected to main app
5. **Check the user profile tab** - See your info and logout button
6. **Logout** - You'll be redirected back to login

## 🎯 Next Steps

1. **Test the login/register flow**
2. **Customize the theme** in `src/theme/colors.ts`
3. **Add more user fields** if needed
4. **Implement password reset** (optional)
5. **Add social login** (optional)
6. **Add email verification** (optional)

## 💡 Tips

- The middleware automatically handles navigation
- All protected screens just need to use `useAuth()`
- Tokens are stored securely and persist across app restarts
- The user profile screen shows how to use the auth system
- Check `docs/AUTHENTICATION.md` for detailed documentation

## 🐛 Troubleshooting

**Not redirecting after login?**
- Check that AuthProvider is in `_layout.tsx`
- Verify middleware is being called

**Token not persisting?**
- SecureStore works on iOS/Android (not web)
- AsyncStorage is used as fallback

**API errors?**
- Check your API URL in environment variables
- Verify backend endpoints match expected format

---

**You're all set!** The authentication system is fully integrated and ready to use. 🎉
