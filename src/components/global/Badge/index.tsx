import {useTheme} from '@/theme';
import {StyleSheet, View} from 'react-native';
import type {IBadgeProps} from '@/components/global/Badge/types';
import Text from '@/components/global/Text';

const Badge = (props: IBadgeProps) => {
  // const { style, text, variant, size } = props;
  const {style, text} = props;
  const {colors} = useTheme();
  const styles = StyleSheet.create({
    badge: {
      padding: 4,
      borderRadius: 8,
      backgroundColor: colors.yellow,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={[styles.badge, style]}>
      <Text>{text}</Text>
    </View>
  );
};

export default Badge;
