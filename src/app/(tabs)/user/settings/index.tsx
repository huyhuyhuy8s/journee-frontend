import {BackgroundController, ForegroundController} from '@/features/map/components';
import {SafeAreaView} from '@/components/global';

const Settings = () => {
  return (
    <SafeAreaView>
      <BackgroundController/>
      <ForegroundController/>
    </SafeAreaView>
  );
};

export default Settings;
