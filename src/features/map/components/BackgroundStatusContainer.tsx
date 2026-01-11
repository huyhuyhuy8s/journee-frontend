import {FastForward, Pause, Question, TurboForward} from '@/assets/icons/pixelated';
import {Text} from '@/components/global';
import {EUserLocationState} from '@/constants';
import {useBackgroundController} from '@/features/map/hooks/useBackgroundController';
import {useTheme} from '@/theme';
import {StyleSheet, View} from 'react-native';

const {FAST_MOVING, SLOW_MOVING, STATIONARY} = EUserLocationState;

const BackgroundStatusContainer = () => {
  const {colors} = useTheme();
  const {
    isBackgroundStarted,
    currentState,
    formattedInterval,
    getStateColor,
  } = useBackgroundController();

  const getStateIcon = (state: EUserLocationState) => {
    const iconProps = {width: 25, height: 25, fill: colors.green900.toString()};

    switch (state) {
      case FAST_MOVING:
        return <TurboForward {...iconProps} />;
      case SLOW_MOVING:
        return <FastForward {...iconProps} />;
      case STATIONARY:
        return <Pause {...iconProps} />;
      default:
        return <Question {...iconProps} />;
    }
  };

  const styles = StyleSheet.create({
    statusContainer: {
      opacity: 0.75,
      alignItems: 'center',
      marginBottom: 16,
      width: '100%',
      backgroundColor: colors.green200,
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
      backgroundColor: isBackgroundStarted
        ? colors.green400
        : colors.orange,
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
      backgroundColor: getStateColor(currentState),
    },
  });

  return (
    <View style={styles.statusContainer}>
      <View style={styles.statusContext}>
        <View
          style={styles.statusDot}
        />
        <Text style={styles.statusText}>
          {isBackgroundStarted ? 'Active' : 'Inactive'}
        </Text>
      </View>

      {isBackgroundStarted && (
        <View style={styles.stateCard}>
          <View style={styles.stateHeader}>
            {getStateIcon(currentState)}
            <View style={styles.stateInfo}>
              <Text style={styles.stateTitle}>
                {currentState.replace('_', ' ')}
              </Text>
              <Text style={styles.stateInterval}>
                Updates every {formattedInterval}
              </Text>
            </View>
          </View>
          <View
            style={styles.stateIndicator}
          />
        </View>
      )}
    </View>
  );
};

export default BackgroundStatusContainer;
