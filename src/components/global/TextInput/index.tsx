import React from 'react';
import {useTheme} from '@/theme';
import {StyleSheet, TextInput as T} from 'react-native';
import type {ITextInputProps} from '@/components/global/TextInput/types';

const TextInput = (props: ITextInputProps) => {
  const {colors} = useTheme();
  const {style, ...restProps} = props;

  const styles = StyleSheet.create({
    input: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.green300,
      fontSize: 16,
      color: colors.green900,
      backgroundColor: colors.green200,
      fontFamily: 'WhyteBook',
    },
  });

  return (
    <T
      {...restProps}
      style={[styles.input, style]}
      placeholderTextColor={colors.green400}
    />
  );
};

export default TextInput;
