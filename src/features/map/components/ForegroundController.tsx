import {Card, Text} from '@/components/global';
import ForegroundStatusContainer from '@/features/map/components/ForegroundStatusContainer';
import {useForegroundController} from '@/features/map/hooks/useForegroundController';
import {useTheme} from '@/theme';
import {type FC} from 'react';
import {StyleSheet, View} from 'react-native';

export const ForegroundController: FC = () => {
  const {colors} = useTheme();
  const {
    isForegroundStarted,
    hasForegroundPermission,
  } = useForegroundController();

  const styles = StyleSheet.create({
    container: {
      margin: 16,
      backgroundColor: colors.green250,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      gap: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: 'WhyteBold',
      color: colors.green900,
    },
    pulseDot: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulse: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.yellow,
      opacity: 0.3,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.yellow,
    },
    permissionWarning: {
      fontSize: 12,
      color: colors.yellow,
      marginTop: 8,
      textAlign: 'center',
    },
  });

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Location</Text>
        {isForegroundStarted && (
          <View style={styles.pulseDot}>
            <View style={styles.pulse}/>
            <View style={styles.dot}/>
          </View>
        )}
      </View>

      <ForegroundStatusContainer/>

      {!hasForegroundPermission && (
        <Text style={styles.permissionWarning}>
          ⚠️ Foreground location permission required
        </Text>
      )}
    </Card>
  );
};
