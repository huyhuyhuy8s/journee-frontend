# Bundle Error Fix - import.meta Not Supported

## Problem
The bundler was failing because `src/config/env.ts` was using Node.js-specific features (`import.meta`, `fileURLToPath`, `path`, `dotenv`) that are not supported in React Native/Hermes.

## Solution Applied

### 1. Fixed `src/config/env.ts`
Removed Node.js-specific imports and replaced with React Native-compatible code:

**Before:**
```typescript
import {fileURLToPath} from "url";
import path from 'path'
import dotenv from 'dotenv'
import _ from 'lodash'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({path: path.join(__dirname, '../../.env')})
```

**After:**
```typescript
// React Native compatible - uses process.env directly
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key];
  return value || defaultValue;
}
```

### 2. Created `babel.config.js`
Added proper Babel configuration for Expo:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
```

### 3. Created `.env.example`
Added a template file for environment variables.

## How Environment Variables Work in Expo

In Expo/React Native:
- Environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app
- Variables are accessed via `process.env.EXPO_PUBLIC_YOUR_VAR`
- No need for `dotenv` package - Expo handles this automatically
- Variables are embedded at build time, not runtime

## Your .env File

Your `.env` file is already correctly configured with `EXPO_PUBLIC_` prefixes:

```env
EXPO_PUBLIC_API_URL=https://journee-1gt3.onrender.com
EXPO_PUBLIC_BACKEND_URL=https://journee-1gt3.onrender.com
EXPO_PUBLIC_FIREBASE_API_KEY=...
# etc.
```

## Next Steps

1. **Clear the cache and restart:**
   ```bash
   npx expo start --clear
   ```

2. **Or for development mode:**
   ```bash
   npm run dev
   ```

3. **For Android build:**
   ```bash
   npm run android
   ```

## Testing

After restarting, the app should:
1. Load without bundling errors
2. Redirect you to the login screen (if not authenticated)
3. Show the beautiful login/register UI
4. Work correctly with the authentication system

## Important Notes

- **Don't use Node.js packages** in React Native code (like `path`, `fs`, `url`, etc.)
- **Environment variables** are embedded at build time
- **Restart the bundler** after changing `.env` files
- **Use `EXPO_PUBLIC_` prefix** for all environment variables you need in the app

## Troubleshooting

If you still see errors:

1. **Clear all caches:**
   ```bash
   rm -rf node_modules
   rm -rf .expo
   rm -rf android/build
   rm -rf android/app/build
   npm install
   npx expo start --clear
   ```

2. **Check for other Node.js imports:**
   Search your codebase for:
   - `import.meta`
   - `__dirname`
   - `__filename`
   - `require('path')`
   - `require('fs')`

3. **Verify babel config:**
   Make sure `babel.config.js` exists and has the correct configuration.

## Files Changed

- ✅ `src/config/env.ts` - Removed Node.js dependencies
- ✅ `babel.config.js` - Created with proper Expo configuration
- ✅ `.env.example` - Created for reference

The error should now be resolved! 🎉
