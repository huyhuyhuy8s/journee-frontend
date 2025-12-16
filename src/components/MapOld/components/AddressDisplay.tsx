import React from "react";
import {Text} from "@/components/global";
import {View} from "react-native";

interface AddressDisplayProps {
  address: any;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({address}) => {
  // 🆕 Extract the best display text from the address object in priority order
  const displayText =
    address?.value ||
    address?.formattedAddress ||
    address?.place ||
    (address?.street
      ? `${address.street}${address.city ? `, ${address.city}` : ""}`
      : "") ||
    "No address available";

  if (!displayText || displayText === "No address available") {
    return null;
  }

  return (
    <View>
      <Text numberOfLines={2} style={{
        fontSize: 14, fontWeight: 600
      }}>
        📍 {address.place}
      </Text>

      {address?.place && address?.place !== displayText && (
        <Text style={{
          fontSize: 12, opacity: 0.8,
          marginTop: 5
        }}>
          🏢 {address.formattedAddress}
        </Text>
      )}
    </View>
  );
};
