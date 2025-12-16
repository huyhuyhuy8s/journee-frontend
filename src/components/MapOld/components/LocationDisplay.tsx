import React from "react";
import * as Location from "expo-location";
import {Text} from "@/components/global";
import {formatCoordinates} from "@/components/Map/utils/locationUtils";

interface LocationDisplayProps {
  location: Location.LocationObject | null;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
                                                                  location,
                                                                }) => {
  return (
    <Text
      style={{
        position: "absolute",
        bottom: 100,
        left: 10,
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: 10,
        borderRadius: 5,
      }}
    >
      {location
        ? formatCoordinates(location.coords.latitude, location.coords.longitude)
        : "Waiting for location..."}
    </Text>
  );
};
