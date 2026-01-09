import {useTheme} from '@/theme';
import {type ColorValue, StyleSheet, View} from 'react-native';
import type {IBadgeProps} from '@/components/global/Badge/types';
import Text from '@/components/global/Text';

const Badge = (props: IBadgeProps) => {
  const {style, text, variant = 'default', size = 'medium'} = props;
  const {colors} = useTheme();

  const sizeStyles: Record<string, {
    paddingVertical: number;
    paddingHorizontal: number;
    borderRadius: number;
    fontSize: number
  }> = {
    small: {paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, fontSize: 12},
    medium: {paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, fontSize: 14},
    large: {paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, fontSize: 16},
  };

  const variantStyles: Record<
    string,
    {
      container: Record<string, ColorValue | string | number>;
      text: Record<string, ColorValue | string | number>
    }
  > = {
    primary: {
      container: {backgroundColor: colors.yellow, borderColor: colors.yellow400},
      text: {color: colors.green900},
    },
    danger: {
      container: {backgroundColor: colors.salmon, borderColor: colors.salmon},
      text: {color: colors.green900},
    },
    secondary: {
      container: {backgroundColor: colors.navy100, borderColor: colors.navy},
      text: {color: colors.green900},
    },
    outline: {
      container: {backgroundColor: 'transparent', borderColor: colors.green900, borderWidth: 2},
      text: {color: colors.green900},
    },
    accent: {
      container: {backgroundColor: colors.salmon100, borderColor: colors.salmon},
      text: {color: colors.green900},
    },
  };

  const s = sizeStyles[size] ?? sizeStyles.medium;
  const v = variantStyles[variant] ?? variantStyles.default;

  const styles = StyleSheet.create({
    badge: {
      paddingVertical: s.paddingVertical,
      paddingHorizontal: s.paddingHorizontal,
      borderRadius: s.borderRadius,
      backgroundColor: v.container.backgroundColor as string,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: (v.container.borderWidth as number) ?? 0,
      borderColor: (v.container.borderColor as string) ?? 'transparent',
      borderStyle: 'dashed',
    },
    text: {
      fontSize: s.fontSize,
      fontFamily: 'WhyteBold',
      color: v.text.color as string,
    },
  });

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default Badge;
