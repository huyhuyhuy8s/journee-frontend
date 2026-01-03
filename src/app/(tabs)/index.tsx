import {StyleSheet, View} from 'react-native';
import {MapViewComponent, RegionComponent} from '@/features/map/components';

const MapTab = () => {

  return (
    <View>
      <MapViewComponent/>
      <View style={styles.mapItems}>
        <RegionComponent/>
      </View>
    </View>
  );
};

export default MapTab;

const styles = StyleSheet.create({
  mapItems: {
    position: 'absolute',
    top: 50,
    left: 0,
  },
});
