import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Badge, Button, Card, Text} from '@/components/global';
import {useTheme} from '@/theme';
import {useLocationState} from '@/contexts/LocationStateContext';
import journalService from '@/services/journalService';
import {formatInterval} from '@/utils/location';
import {EUserLocationState} from '@/constants';

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
        return '#EF4444';
      case SLOW_MOVING:
        return '#F59E0B';
      case STATIONARY:
        return '#10B981';
      default:
        return colors.text700.toString();
    }
  };

  const getStateEmoji = (state: EUserLocationState): string => {
    switch (state) {
      case FAST_MOVING:
        return '🚗';
      case SLOW_MOVING:
        return '🚶';
      case STATIONARY:
        return '🧘';
      default:
        return '❓';
    }
  };

  const styles = StyleSheet.create({
    container: {
      margin: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      color: colors.text600,
    },
    stateCard: {
      backgroundColor: colors.background700,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.background600,
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
      fontWeight: '600',
      color: colors.text,
      textTransform: 'capitalize',
    },
    stateInterval: {
      fontSize: 13,
      color: colors.text600,
      marginTop: 2,
    },
    stateIndicator: {
      height: 4,
      borderRadius: 2,
      marginTop: 12,
    },
    permissionWarning: {
      fontSize: 12,
      color: '#F59E0B',
      marginTop: 8,
      textAlign: 'center',
    },
  });

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Background Tracking</Text>
        {unsyncedCount > 0 && (
          <Badge text={`${unsyncedCount} unsynced`} variant="warning"/>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isBackgroundStarted ? '#10B981' : colors.text700,
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
            <Text style={styles.stateEmoji}>{getStateEmoji(currentState)}</Text>
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
