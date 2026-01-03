import {Icon, Label, NativeTabs, VectorIcon} from 'expo-router/unstable-native-tabs';
import {MaterialIcons} from '@expo/vector-icons/';
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
        <Icon src={<VectorIcon family={MaterialIcons} name="newspaper"/>}/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="inbox">
        <Label>Inbox</Label>
        <Icon src={<VectorIcon family={MaterialIcons} name="inbox"/>}/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="index">
        <Label>Map</Label>
        <Icon src={<VectorIcon family={MaterialIcons} name="map"/>}/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="directory">
        <Label>Directory</Label>
        <Icon src={<VectorIcon family={MaterialIcons} name="contacts"/>}/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="user">
        <Label>User</Label>
        <Icon src={<VectorIcon family={MaterialIcons} name="account-box"/>}/>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabLayout;
