import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from '@/components/global';
import {useLocationState} from '@/contexts/LocationStateContext';
import {Viewblocks} from '@/assets/icons/pixelated';
import {useTheme} from '@/theme';
import {useRegion} from '@/contexts/RegionContext';
import {useMemo} from 'react';

export const RegionComponent = () => {
  const {location} = useLocationState();
  const {toUserRegion} = useRegion();
  const {colors} = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    region: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      width: '100%',
    },
    regionContext: {
      gap: 4,
    },
  }), []);

  return (
    <View style={styles.region}>
      <View style={styles.regionContext}>
        <Text>{location.city ?? location.region}</Text>
        <Text>{location.subregion}</Text>
        <Text>{location.place} {location.street}</Text>
      </View>
      <TouchableOpacity onPress={toUserRegion}>
        <Viewblocks width={25} height={25} fill={colors.green900}/>
      </TouchableOpacity>
    </View>
  );
};
