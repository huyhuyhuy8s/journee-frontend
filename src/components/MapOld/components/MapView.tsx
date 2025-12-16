import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Region } from "react-native-maps";

interface MapViewComponentProps {
  region: Region;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  region,
}) => {
  return (
    <MapView
      style={styles.map}
      region={region}
      showsUserLocation={true}
      showsMyLocationButton={true}
      followsUserLocation={true}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
