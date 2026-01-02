import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useRegion } from '@/contexts/RegionContext';
import { useTheme } from '@/theme';
import { getMapStyle } from '@/features/map/utils/mapStyles';

export const MapViewComponent = () => {
  const { region } = useRegion();
  const { isDark } = useTheme();

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      customMapStyle={getMapStyle(isDark ? 'dark' : 'light')}
      userInterfaceStyle={isDark ? 'dark' : 'light'}
      style={styles.map}
      region={region}
      showsUserLocation={true}
      showsMyLocationButton={false}
      followsUserLocation={true}
      showsCompass={false}
      showsScale={true}
      showsBuildings={true}
      showsTraffic={false}
      showsIndoors={false}
      pitchEnabled={true}
      rotateEnabled={true}
      scrollEnabled={true}
      zoomEnabled={true}
      loadingEnabled={true}
      loadingIndicatorColor={isDark ? '#ffffff' : '#000000'}
      loadingBackgroundColor={isDark ? '#212121' : '#f5f5f5'}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});
