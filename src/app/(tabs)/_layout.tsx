import {Icon, Label, NativeTabs} from 'expo-router/unstable-native-tabs';
import {useTheme} from '@/theme';

const TabLayout = () => {
  const {colors} = useTheme();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      labelStyle={{color: colors.green900, fontFamily: 'PPNeueMontrealMedium'}}
      tintColor={colors.yellow700}
      iconColor={colors.green900}
      backgroundColor={colors.green100}
      indicatorColor={colors.green}
      badgeTextColor={colors.yellow}
    >
      <NativeTabs.Trigger name="newsfeed">
        <Label>Newsfeed</Label>
        <Icon src={require('@/assets/icons/pixelated-png/for-light-mode/regular/newspaper.png')}/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="inbox">
        <Label>Inbox</Label>
        <Icon src={require('@/assets/icons/pixelated-png/for-light-mode/regular/message.png')}/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="index">
        <Label>Map</Label>
        <Icon src={require('@/assets/icons/pixelated-png/for-light-mode/regular/globe-americas.png')}/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="directory">
        <Label>Directory</Label>
        <Icon src={require('@/assets/icons/pixelated-png/for-light-mode/regular/users.png')}/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="user">
        <Label>User</Label>
        <Icon src={require('@/assets/icons/pixelated-png/for-light-mode/regular/user.png')}/>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabLayout;
