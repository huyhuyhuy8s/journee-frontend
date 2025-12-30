import {StyleSheet, View} from "react-native";
import {MapViewComponent, RegionComponent} from "@/features/map/components";

const Map = () => {
  const styles = StyleSheet.create({
    mapItems: {
      position: 'absolute',
      top: 50,
      left: 0,
    }
  })

  return (
    <View>
      <MapViewComponent/>
      <View style={styles.mapItems}>
        <RegionComponent/>
      </View>
    </View>
  )
}

export default Map;
