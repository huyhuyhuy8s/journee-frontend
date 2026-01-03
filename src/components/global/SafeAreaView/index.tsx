import {useTheme} from '@/theme';
import {SafeAreaView as SAV} from 'react-native-safe-area-context';
import React from 'react';
import type {ISafeAreaViewProps} from '@/components/global/SafeAreaView/types';

const SafeAreaView = (props: ISafeAreaViewProps) => {
  const {colors} = useTheme();

  return (
    <SAV
      style={{
        backgroundColor: colors.green100,
        height: '100%',
        ...props.style,
      }}
    >
      {props.children}
    </SAV>
  );
};

export default SafeAreaView;
