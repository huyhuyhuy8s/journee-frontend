# Login Error Fix - SecureStore Invalid Value

## Problem
Getting error: "Invalid value provided to SecureStore. Values must be strings"

This means the API response is not returning the token in the expected format.

## Root Cause
SecureStore.setItemAsync() only accepts **string** values. The error occurs when:
1. Token is `null` or `undefined`
2. Token is an object instead of a string
3. Token is a number or boolean

## Fixes Applied

### 1. Added Token Validation in AuthContext
- Validates token exists and is a string before storing
- Converts token to string with `String(authToken).trim()`
- Validates user data exists and is an object
- Added detailed console logging to help debug

### 2. Fixed Babel Warning
- Removed deprecated `expo-router/babel` from babel.config.js
- `babel-preset-expo` now includes expo-router support in SDK 50+

### 3. Fixed Route Warning
- Changed `name="users"` to `name="users/[userId]"` in _layout.tsx
- Matches the actual file structure

## Debug Your API Response

The updated code now logs detailed information. Check your console for:

```
🔐 Attempting login to: https://journee-1gt3.onrender.com/api/users/login
📦 Login response received: { status: 200, hasData: true, dataKeys: [...] }
🔍 Token validation: { tokenExists: true, tokenType: 'string', ... }
```

## Expected API Response Format

Your backend should return:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // Must be a STRING
  "user": {
    "_id": "user123",
    "email": "user@example.com",
    "username": "username",
    "firstName": "First",
    "lastName": "Last"
  }
}
```

## Common Issues

### Issue 1: Token is wrapped in an object
**Wrong:**
```json
{
  "token": { "value": "eyJhbGc..." },
  "user": { ... }
}
```

**Correct:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Issue 2: Token is null/undefined
**Wrong:**
```json
{
  "token": null,
  "user": { ... }
}
```

**Correct:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Issue 3: Response structure is different
**Wrong:**
```json
{
  "data": {
    "token": "...",
    "user": { ... }
  }
}
```

**Correct:**
```json
{
  "token": "...",
  "user": { ... }
}
```

## Testing Steps

1. **Clear cache and restart:**
   ```bash
   npx expo start --clear
   ```

2. **Try logging in** with valid credentials

3. **Check the console logs** - You should see:
   - 🔐 Attempting login
   - 📦 Login response received
   - 🔍 Token validation
   - ✅ Login successful

4. **If you see errors**, check the logged values:
   - What is the `tokenType`? (should be 'string')
   - What are the `dataKeys`? (should include 'token' and 'user')

## Backend Fix (if needed)

If your backend is not returning the correct format, update your login endpoint:

### Express.js Example:
```javascript
// Login route
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate user...
    const user = await User.findOne({ email });
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, SECRET_KEY);
    
    // Return in correct format
    res.json({
      token: token,  // Make sure this is a string
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
```

## Quick Test with Mock Data

To test if the frontend works, you can temporarily mock the response:

```typescript
// In AuthContext.tsx login function, replace the axios call with:
const response = {
  data: {
    token: "mock_token_12345678901234567890",
    user: {
      _id: "mock_user_id",
      email: email,
      username: "testuser",
      firstName: "Test",
      lastName: "User",
    }
  }
};
```

If this works, the issue is with your backend API response format.

## Next Steps

1. **Check console logs** to see the exact response format
2. **Verify backend** returns token as a string
3. **Test login** and check if it works
4. **Report back** with the console output if still having issues

The validation and logging will help identify exactly what the backend is returning! 🔍
