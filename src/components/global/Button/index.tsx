import React from 'react';
import {useTheme} from '@/theme';
import {StyleSheet, TouchableOpacity} from 'react-native';
import type {IButtonProps} from '@/components/global/Button/types';
import Text from '@/components/global/Text';

const Button = (props: IButtonProps) => {
  const {colors} = useTheme();
  const {style, title, onPress, disabled, ...restProps} = props;

  const styles = StyleSheet.create({
    container: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.green,
      backgroundColor: colors.green100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontFamily: 'WhyteBold',
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      {...restProps}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
