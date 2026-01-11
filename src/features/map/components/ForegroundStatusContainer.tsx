import {LocationPin} from '@/assets/icons/pixelated';
import {Button, Text} from '@/components/global';
import {useForegroundController} from '@/features/map/hooks/useForegroundController';
import {useTheme} from '@/theme';
import {StyleSheet, View} from 'react-native';

const ForegroundStatusContainer = () => {
  const {colors} = useTheme();
  const {
    isForegroundStarted,
    currentLocation,
    updateCount,
    timeSinceUpdate,
    handleToggleTracking,
  } = useForegroundController();

  const styles = StyleSheet.create({
    infoCard: {
      width: '100%',
      backgroundColor: colors.green200,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.green400,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.green800,
      fontFamily: 'WhyteMedium',
    },
    infoValue: {
      fontSize: 14,
      color: colors.green900,
      fontFamily: 'PPNeueMontrealRegular',
    },
    divider: {
      height: 1,
      backgroundColor: colors.green700,
    },
    placeholderCard: {
      backgroundColor: colors.green200,
      opacity: 0.75,
      borderRadius: 12,
      padding: 32,
      marginBottom: 16,
      alignItems: 'center',
      borderColor: colors.green700,
      borderStyle: 'dashed',
      gap: 12,
    },
    placeholderText: {
      fontSize: 14,
      color: colors.green900,
      textAlign: 'center',
    },
  });

  return (
    <>
      {isForegroundStarted && currentLocation ? (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Latitude</Text>
            <Text style={styles.infoValue}>
              {currentLocation.latitude.toFixed(6)}
            </Text>
          </View>

          <View style={styles.divider}/>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Longitude</Text>
            <Text style={styles.infoValue}>
              {currentLocation.longitude.toFixed(6)}
            </Text>
          </View>

          <View style={styles.divider}/>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Updates</Text>
            <Text style={styles.infoValue}>{updateCount}</Text>
          </View>

          <View style={styles.divider}/>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Update</Text>
            <Text style={styles.infoValue}>{timeSinceUpdate}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderCard}>
          <LocationPin
            width={50}
            height={50}
            fill={colors.green900.toString()}
          />
          <Text style={styles.placeholderText}>
            Start tracking to see your real-time location
          </Text>
        </View>
      )}

      <Button
        title={isForegroundStarted ? 'Stop Live Tracking' : 'Start Live Tracking'}
        variant={isForegroundStarted ? 'danger' : 'primary'}
        onPress={handleToggleTracking}
      />
    </>
  );
};

export default ForegroundStatusContainer;
