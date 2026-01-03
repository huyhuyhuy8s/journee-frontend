import React from 'react';
import {useTheme} from '@/theme';
import {type ColorValue, StyleSheet, TouchableOpacity} from 'react-native';
import type {IButtonProps} from '@/components/global/Button/types';
import Text from '@/components/global/Text';

const Button = (props: IButtonProps) => {
  const {colors} = useTheme();
  const {style, title, onPress, disabled, variant, ...restProps} = props;

  const styles = StyleSheet.create({
    container: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontFamily: 'WhyteBold',
    },
  });

  const variantStyles: Record<
    string,
    {
      container: Record<string, ColorValue | number | string>;
      text: Record<string, ColorValue | number | string>
    }
  > = {
    primary: {
      container: {
        borderColor: colors.yellow400,
        backgroundColor: colors.yellow,
      },
      text: {
        color: colors.yellow100,
      },
    },
    danger: {
      container: {
        borderColor: colors.orange400,
        backgroundColor: colors.orange,
      },
      text: {
        color: colors.orange900,
      },
    },
    secondary: {
      container: {
        borderColor: colors.navy,
        backgroundColor: colors.navy100,
      },
      text: {
        color: colors.navy900,
      },
    },
    outline: {
      container: {
        borderColor: colors.green,
        borderWidth: 2,
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
      },
      text: {
        color: colors.green900,
      },
    },
    accent: {
      container: {
        borderColor: colors.salmon,
        backgroundColor: colors.salmon100,
      },
      text: {
        color: colors.salmon900,
      },
    },
  };

  const chosenVariant = variant ?? 'primary';
  const vStyle = variantStyles[chosenVariant] ?? variantStyles.primary;

  const containerStyle = [
    styles.container,
    vStyle.container,
    disabled ? {opacity: 0.6} : undefined,
    style,
  ];

  const textStyle = [styles.text, vStyle.text];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={containerStyle}
      {...restProps}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
