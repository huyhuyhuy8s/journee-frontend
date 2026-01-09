import {StyleSheet, View} from 'react-native';
import {MapViewComponent, RegionComponent} from '@/features/map/components';
import {useTheme} from '@/theme';
import {useMemo} from 'react';

const MapTab = () => {
  const {colors} = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    map: {
      backgroundColor: colors.green100,
    },
    mapItems: {
      position: 'absolute',
      top: 50,
      left: 0,
    },
  }), [colors]);

  return (
    <View style={styles.map}>
      <MapViewComponent/>
      <View style={styles.mapItems}>
        <RegionComponent/>
      </View>
    </View>
  );
};

export default MapTab;
