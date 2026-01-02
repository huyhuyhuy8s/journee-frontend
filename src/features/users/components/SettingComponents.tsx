import { StyleSheet, View } from 'react-native';
import {
  BackgroundController,
  ForegroundController,
} from '@/features/map/components';
import { Button } from '@/components/global';
import { useState } from 'react';

interface ISettingComponentsProps {
  style?: object;
}

const SettingComponents = (props: ISettingComponentsProps) => {
  const styles = StyleSheet.create({
    controllers: {
      position: 'absolute',
      top: 30,
      left: 0,
      height: '90%',
      justifyContent: 'space-between',
    },
    button: {
      fontWeight: 'bold',
    },
  });
  const [settings, setSettings] = useState(false);

  const SettingButton = (props: { style?: object }) => {
    return (
      <Button
        variant="primary"
        title="Settings"
        style={[props.style]}
        onPress={async () => {
          setSettings(!settings);
        }}
      />
    );
  };

  if (settings)
    return (
      <View style={[styles.controllers]}>
        <SettingButton style={[props.style, styles.button]} />
        <BackgroundController />
        <ForegroundController />
      </View>
    );

  return <SettingButton style={[props.style, styles.button]} />;
};

export default SettingComponents;
