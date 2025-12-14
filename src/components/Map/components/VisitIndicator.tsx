import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
import { VisitDetectionService } from "@/src/services/visitDetectionService";

interface VisitIndicatorProps {
  isTracking: boolean;
}

export const VisitIndicator: React.FC<VisitIndicatorProps> = ({
  isTracking,
}) => {
  const [pendingVisit, setPendingVisit] = useState<any>(null);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);

  useEffect(() => {
    if (!isTracking) return;

    const updateVisitStatus = async () => {
      try {
        const pending = await VisitDetectionService.getCurrentPendingVisit();
        setPendingVisit(pending);

        const recent = await VisitDetectionService.getVisitsSince(
          Date.now() - 24 * 60 * 60 * 1000
        ); // Last 24 hours
        setRecentVisits(recent.slice(-3)); // Show last 3 visits
      } catch (error) {
        console.error("❌ Error updating visit status:", error);
      }
    };

    updateVisitStatus();
    const interval = setInterval(updateVisitStatus, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isTracking]);

  if (!isTracking) return null;

  const getPendingVisitText = () => {
    if (!pendingVisit) return null;

    const duration = Date.now() - pendingVisit.firstDetectedTime;
    const minutes = Math.floor(duration / 1000 / 60);
    const seconds = Math.floor((duration / 1000) % 60);

    return `⏳ Detecting visit...\n${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 100,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 8,
        borderRadius: 8,
        minWidth: 120,
      }}
      onPress={() => {
        // You could show a modal with visit history here
        console.log("Recent visits:", recentVisits);
      }}
    >
      {pendingVisit ? (
        <Text
          style={{
            color: "#FFA500",
            fontSize: 10,
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {getPendingVisitText()}
        </Text>
      ) : (
        <Text
          style={{
            color: "white",
            fontSize: 10,
            textAlign: "center",
          }}
        >
          {`📍 Visits: ${recentVisits.length}\n(last 24h)`}
        </Text>
      )}

      {recentVisits.length > 0 && (
        <Text
          style={{
            color: "#ccc",
            fontSize: 8,
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Last: {recentVisits[recentVisits.length - 1]?.place?.substring(0, 15)}
          ...
        </Text>
      )}
    </TouchableOpacity>
  );
};
