// components/Map/components/AddressDisplay.tsx
import React from "react";
import { Text, View } from "tamagui";
import type { Address } from "@/src/components/Map/utils/types";

interface AddressDisplayProps {
  address: Address;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ address }) => {
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
    <View
      position="absolute"
      t={50}
      l={10}
      r={10}
      width={250}
      bg="rgba(255, 255, 255, 0.9)"
      p={12}
      borderRadius={8}
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevationAndroid={3}
    >
      <Text fontSize={14} fontWeight="600" color="$color" numberOfLines={2}>
        📍 {address.place}
      </Text>

      {/* 🆕 Show additional info if available */}
      {address?.place && address?.place !== displayText && (
        <Text fontSize={12} color="$color" opacity={0.8} mt={4}>
          🏢 {address.formattedAddress}
        </Text>
      )}
    </View>
  );
};
