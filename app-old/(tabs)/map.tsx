// app-old/(tabs)/index.tsx
import Map from "@/src/components/Map";
import { View } from "tamagui";

export default <View></View>;

// app-old/(tabs)/Map.tsx
// import React from "react";
// import { View, StyleSheet, Dimensions } from "react-native";
// import MapView, { Region } from "react-native-maps";

// const { width, height } = Dimensions.get('window');

// const Map = () => {
//   console.log("Map component rendered");

//   // 🆕 Define initial region (required for MapView)
//   const initialRegion: Region = {
//     latitude: 37.78825,    // Default to San Francisco
//     longitude: -122.4324,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={initialRegion}
//         showsUserLocation={true}
//         showsMyLocationButton={true}
//         followsUserLocation={true}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: width,
//     height: height,
//   },
// });

// export default Map;
