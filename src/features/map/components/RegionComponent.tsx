import {View} from 'react-native';
import {Text} from '@/components/global';
import Android from '@/assets/icons/pixelated/solid/robot-solid.svg';

export const RegionComponent = () => {
  return (
    <View>
      <Text>Region Component</Text>
      <Android width={24} height={24} fill="#000"/>
    </View>
  );
};
