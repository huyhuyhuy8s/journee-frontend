import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Card, Text } from '@/components/global';
import { useTheme } from '@/theme';
import { useLocationState } from '@/contexts/LocationStateContext';
import { ASYNC_STORAGE_KEYS } from '@/constants';
import { formatCoordinate } from '@/utils/location';

const { CURRENT_LOCATION } = ASYNC_STORAGE_KEYS;

interface ICurrentLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export const ForegroundController: React.FC = () => {
  const { colors } = useTheme();
  const {
    isForegroundStarted,
    startForegroundTracking,
    stopForegroundTracking,
    hasLocationPermission,
    requestPermissions,
  } = useLocationState();

  const [currentLocation, setCurrentLocation] =
    useState<ICurrentLocation | null>(null);
  const [updateCount, setUpdateCount] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const locationJson = await AsyncStorage.getItem(CURRENT_LOCATION);
      if (locationJson) {
        try {
          const location = JSON.parse(locationJson);
          setCurrentLocation(location);
          setUpdateCount((prev) => prev + 1);
        } catch (error) {
          console.error('Error parsing location from AsyncStorage', error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleTracking = async (): Promise<void> => {
    if (!hasLocationPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        alert('Location permission is required');
        return;
      }
    }

    if (isForegroundStarted) {
      await stopForegroundTracking();
      setCurrentLocation(null);
      setUpdateCount(0);
    } else {
      await startForegroundTracking();
    }
  };

  const getTimeSinceUpdate = (): string => {
    if (!currentLocation) return '-';

    const seconds = Math.floor((Date.now() - currentLocation.timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const styles = StyleSheet.create({
    container: {
      margin: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
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
      backgroundColor: colors.primary,
      opacity: 0.3,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    infoCard: {
      backgroundColor: colors.background100,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.background100,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.text600,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
      fontFamily: 'monospace',
    },
    divider: {
      height: 1,
      backgroundColor: colors.background600,
    },
    placeholderCard: {
      backgroundColor: colors.background100,
      borderRadius: 12,
      padding: 32,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.background600,
      borderStyle: 'dashed',
    },
    placeholderIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    placeholderText: {
      fontSize: 14,
      color: colors.text600,
      textAlign: 'center',
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
        <Text style={styles.title}>Live Location</Text>
        {isForegroundStarted && (
          <View style={styles.pulseDot}>
            <View style={styles.pulse} />
            <View style={styles.dot} />
          </View>
        )}
      </View>

      {isForegroundStarted && currentLocation && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Latitude</Text>
            <Text style={styles.infoValue}>
              {formatCoordinate(currentLocation.latitude)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Longitude</Text>
            <Text style={styles.infoValue}>
              {formatCoordinate(currentLocation.longitude)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Updates</Text>
            <Text style={styles.infoValue}>{updateCount}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Update</Text>
            <Text style={styles.infoValue}>{getTimeSinceUpdate()}</Text>
          </View>
        </View>
      )}

      {!isForegroundStarted && (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderIcon}>📍</Text>
          <Text style={styles.placeholderText}>
            Start tracking to see your real-time location
          </Text>
        </View>
      )}

      <Button
        title={
          isForegroundStarted ? 'Stop Live Tracking' : 'Start Live Tracking'
        }
        variant={isForegroundStarted ? 'danger' : 'primary'}
        onPress={handleToggleTracking}
      />

      {!hasLocationPermission && (
        <Text style={styles.permissionWarning}>
          ⚠️ Location permission required
        </Text>
      )}
    </Card>
  );
};
