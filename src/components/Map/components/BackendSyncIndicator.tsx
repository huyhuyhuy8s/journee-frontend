import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
import { BackendApiServices } from "@/src/services/backendApiServices";

interface BackendSyncIndicatorProps {
  isTracking: boolean;
}

export const BackendSyncIndicator: React.FC<BackendSyncIndicatorProps> = ({
  isTracking,
}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isTracking) return;

    const updateSyncStatus = async () => {
      const count = await BackendApiServices.getPendingRequestsCount();
      setPendingCount(count);
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking || pendingCount === 0) return;

    // Auto-retry pending requests every 30 seconds if there are any
    const retryInterval = setInterval(async () => {
      if (!isRetrying) {
        setIsRetrying(true);
        await BackendApiServices.retryPendingRequests();
        setLastSyncTime(Date.now());
        setIsRetrying(false);
      }
    }, 30000);

    return () => clearInterval(retryInterval);
  }, [isTracking, pendingCount, isRetrying]);

  const handleManualSync = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    await BackendApiServices.retryPendingRequests();
    setLastSyncTime(Date.now());
    setIsRetrying(false);
  };

  if (!isTracking) return null;

  const getSyncStatusColor = () => {
    if (isRetrying) return "#FFA500";
    if (pendingCount > 0) return "#F44336";
    return "#4CAF50";
  };

  const getSyncStatusText = () => {
    if (isRetrying) return "Syncing...";
    if (pendingCount > 0) return `${pendingCount} pending`;
    return "Synced";
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return "";
    const minutes = Math.floor((Date.now() - lastSyncTime) / 1000 / 60);
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1min ago";
    return `${minutes}min ago`;
  };

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 165,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 8,
        borderRadius: 8,
        minWidth: 80,
        alignItems: "center",
      }}
      onPress={handleManualSync}
      disabled={isRetrying}
    >
      <Text
        style={{
          color: getSyncStatusColor(),
          fontSize: 10,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        🌐 {getSyncStatusText()}
      </Text>

      {lastSyncTime && (
        <Text
          style={{
            color: "#ccc",
            fontSize: 8,
            textAlign: "center",
            marginTop: 2,
          }}
        >
          {getLastSyncText()}
        </Text>
      )}

      {pendingCount > 0 && (
        <Text
          style={{
            color: "#fff",
            fontSize: 8,
            textAlign: "center",
            marginTop: 2,
          }}
        >
          Tap to retry
        </Text>
      )}
    </TouchableOpacity>
  );
};
