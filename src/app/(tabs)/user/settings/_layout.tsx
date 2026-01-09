import {Stack, useRouter} from 'expo-router';
import {AngleLeft} from '@/assets/icons/pixelated';
import {useTheme} from '@/theme';
import {TouchableOpacity} from 'react-native';
import {type NativeStackHeaderItem} from '@react-navigation/native-stack';

const SettingsLayout = () => {
  const {colors} = useTheme();
  const router = useRouter();

  return (
    <Stack screenOptions={{
      headerStyle: {backgroundColor: colors.green100.toString()},
      headerTitleAlign: 'center',
      headerTitleStyle: {
        fontFamily: 'PPNeueMontrealMedium',
        fontSize: 16,
        color: colors.green900.toString(),
      },
      headerLeft: ({canGoBack}) => {
        if (!canGoBack) return null;
        return (
          <TouchableOpacity onPress={() => router.back()}>
            <AngleLeft width={25} height={25} fill={colors.green900.toString()}/>
          </TouchableOpacity>
        );
      },
      unstable_headerLeftItems: ({canGoBack}): NativeStackHeaderItem[] => {
        if (!canGoBack) return [];
        return [
          {
            type: 'custom',
            element: (
              <TouchableOpacity onPress={() => router.back()}>
                <AngleLeft width={25} height={25} fill={colors.green900.toString()}/>
              </TouchableOpacity>
            ),
          },
        ];
      },
    }}>
      <Stack.Screen name="index" options={{
        title: 'Locations',
      }}/>
    </Stack>
  );
};

export default SettingsLayout;
