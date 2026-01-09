import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Badge, Button, Card, Text} from '@/components/global';
import {useTheme} from '@/theme';
import {useLocationState} from '@/contexts/LocationStateContext';
import journalService from '@/services/journalService';
import {formatInterval} from '@/utils/location';
import {EUserLocationState} from '@/constants';
import {FastForward, Pause, Question, TurboForward} from '@/assets/icons/pixelated';

const {FAST_MOVING, SLOW_MOVING, STATIONARY} = EUserLocationState;

export const BackgroundController: React.FC = () => {
  const {colors} = useTheme();
  const {
    isBackgroundStarted,
    startBackgroundTracking,
    stopBackgroundTracking,
    currentState,
    currentInterval,
    hasBackgroundPermission,
    requestPermissions,
  } = useLocationState();

  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await journalService.getUnsyncedCount();
      setUnsyncedCount(count);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleTracking = async (): Promise<void> => {
    if (!hasBackgroundPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Background location permission is required to start tracking.',
        );
        return;
      }
    }

    if (isBackgroundStarted) {
      await stopBackgroundTracking();
    } else {
      await startBackgroundTracking();
    }
  };

  const getStateColor = (state: EUserLocationState): string => {
    switch (state) {
      case FAST_MOVING:
        return colors.orange.toString();
      case SLOW_MOVING:
        return colors.yellow.toString();
      case STATIONARY:
        return colors.green400.toString();
      default:
        return colors.green.toString();
    }
  };

  const getStateEmoji = (state: EUserLocationState) => {
    switch (state) {
      case FAST_MOVING:
        return <TurboForward width={25} height={25} fill={colors.green900.toString()}/>;
      case SLOW_MOVING:
        return <FastForward width={25} height={25} fill={colors.green900.toString()}/>;
      case STATIONARY:
        return <Pause width={25} height={25} fill={colors.green900.toString()}/>;
      default:
        return <Question width={25} height={25} fill={colors.green900.toString()}/>;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.green250,
      margin: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      gap: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: 'WhyteBold',
      color: colors.green900,
    },
    statusContainer: {
      opacity: 0.75,
      alignItems: 'center',
      marginBottom: 16,
      width: '100%',
      backgroundColor: colors.green200,
      alignContent: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingVertical: 16,
      gap: 12,
    },
    statusContext: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      color: colors.green900,
    },
    stateCard: {
      backgroundColor: colors.green200,
      borderRadius: 12,
      paddingHorizontal: 36,
      paddingVertical: 12,
      borderColor: colors.green700,
      borderWidth: 1,
    },
    stateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stateEmoji: {
      fontSize: 32,
      marginRight: 12,
    },
    stateInfo: {
      flex: 1,
    },
    stateTitle: {
      fontSize: 16,
      fontFamily: 'WhyteBold',
      color: colors.salmon,
      textTransform: 'capitalize',
    },
    stateInterval: {
      fontSize: 13,
      color: colors.green300,
      marginTop: 2,
    },
    stateIndicator: {
      height: 4,
      borderRadius: 2,
      marginTop: 12,
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
        <Text style={styles.title}>Background Tracking</Text>
        {unsyncedCount > 0 && (
          <Badge text={`${unsyncedCount} unsynced`} variant="outline"/>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusContext}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isBackgroundStarted ? colors.green400 : colors.orange,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {isBackgroundStarted ? 'Active' : 'Inactive'}
          </Text>
        </View>
        {isBackgroundStarted && (
          <View style={styles.stateCard}>
            <View style={styles.stateHeader}>
              {getStateEmoji(currentState)}
              <View style={styles.stateInfo}>
                <Text style={styles.stateTitle}>
                  {currentState.replace('_', ' ')}
                </Text>
                <Text style={styles.stateInterval}>
                  Updates every {formatInterval(currentInterval)}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.stateIndicator,
                {backgroundColor: getStateColor(currentState)},
              ]}
            />
          </View>
        )}
      </View>

      <Button
        title={isBackgroundStarted ? 'Stop Tracking' : 'Start Tracking'}
        variant={isBackgroundStarted ? 'danger' : 'primary'}
        onPress={handleToggleTracking}
      />

      {!hasBackgroundPermission && (
        <Text style={styles.permissionWarning}>
          ⚠️ Background location permission required
        </Text>
      )}
    </Card>
  );
};
