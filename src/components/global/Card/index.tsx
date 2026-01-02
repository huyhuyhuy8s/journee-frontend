import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import type { ICardProps } from '@/components/global/Card/types';

const Card = (props: ICardProps) => {
  const { colors } = useTheme();
  const { style, elevation, children } = props;

  const styles = StyleSheet.create({
    card: {
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background200,
      elevation: elevation ?? 2,
    },
  });

  return <View style={[styles.card, style]}>{children}</View>;
};

export default Card;
