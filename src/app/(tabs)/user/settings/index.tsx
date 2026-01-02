import {SafeAreaView, Text} from '@/components/global';
import {View} from 'react-native';
import {BackgroundController, ForegroundController} from '@/features/map/components';

const Settings = () => {
  return (
    <SafeAreaView>
      <Text>Settings</Text>
      <View>
        <BackgroundController/>
        <ForegroundController/>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
