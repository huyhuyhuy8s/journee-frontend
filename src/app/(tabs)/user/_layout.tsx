import { Stack } from 'expo-router';

const UserLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack>
  );
};

export default UserLayout;
