// services/backgroundLocationService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalGeocodingService } from "./geocodingService";
import * as Location from "expo-location";

interface MovementState {
  state: "STATIONARY" | "SLOW_MOVING" | "FAST_MOVING";
  speed?: number;
  confidence: number;
}

interface Visit {
  id: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string;
  duration: number;
  type: "brief" | "short" | "extended";
  confidence: "low" | "medium" | "high";
}

export class BackgroundLocationService {
  private static authToken: string | null = null;
  private static isInitialized = false;
  private static readonly BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "https://journee-1gt3.onrender.com";

  // Movement detection state
  private static recentLocations: Location.LocationObject[] = [];
  private static currentMovementState: MovementState = {
    state: "STATIONARY",
    confidence: 0,
  };
  private static pendingVisit: any = null;

  /**
   * Initialize service with authentication token
   */
  static initialize(token: string) {
    this.authToken = token;
    this.isInitialized = true;
    console.log("🚀 [BACKGROUND] Service initialized with auth token");
  }

  /**
   * Update authentication token
   */
  static updateToken(token: string | null) {
    this.authToken = token;
    console.log(`🔑 [BACKGROUND] Token ${token ? "updated" : "cleared"}`);
  }

  /**
   * Main method to process location updates in background
   */
  static async processLocationUpdate(
    location: Location.LocationObject,
    providedToken?: string | null
  ) {
    try {
      console.log("🔄 Processing background location...");

      // 🆕 Handle token authentication
      const token = await this.ensureAuthToken(providedToken);
      if (!token) {
        console.error("❌ No authentication token available");
        return;
      }

      // Process movement detection
      const movementState = await this.detectMovementState(location);
      console.log(
        `🔍 Visit detection: ${
          movementState.state
        }, speed: ${movementState.speed?.toFixed(2)} km/h`
      );

      // Handle visit detection
      await this.handleVisitDetection(location, movementState);

      // Store location locally
      await this.storeLocationLocally(location, movementState);
    } catch (error) {
      console.error("❌ Error processing background location:", error);
    }
  }

  /**
   * Ensure we have a valid auth token
   */
  private static async ensureAuthToken(
    providedToken?: string | null
  ): Promise<string | null> {
    // Use provided token first
    if (providedToken) {
      this.authToken = providedToken;
      return providedToken;
    }

    // Use stored token
    if (this.authToken) {
      return this.authToken;
    }

    // Fallback to AsyncStorage
    try {
      const fallbackToken = await AsyncStorage.getItem("authToken");
      if (fallbackToken) {
        this.authToken = fallbackToken;
        console.log("✅ [BACKGROUND] Retrieved token from AsyncStorage");
        return fallbackToken;
      }
    } catch (error) {
      console.error(
        "❌ [BACKGROUND] Failed to get token from AsyncStorage:",
        error
      );
    }

    return null;
  }

  /**
   * Detect movement state based on recent locations
   */
  private static async detectMovementState(
    location: Location.LocationObject
  ): Promise<MovementState> {
    // Add to recent locations (keep last 5)
    this.recentLocations.push(location);
    if (this.recentLocations.length > 5) {
      this.recentLocations.shift();
    }

    if (this.recentLocations.length < 2) {
      return { state: "STATIONARY", speed: 0, confidence: 0.5 };
    }

    // Calculate speeds
    const speeds: number[] = [];
    for (let i = 1; i < this.recentLocations.length; i++) {
      const prev = this.recentLocations[i - 1];
      const curr = this.recentLocations[i];
      const speed = this.calculateSpeed(prev, curr);
      speeds.push(speed);
    }

    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);

    console.log(
      `🔍 Validating ${
        this.currentMovementState.state
      } → STATIONARY: ${JSON.stringify({
        avgSpeed: avgSpeed.toFixed(2),
        maxSpeed: maxSpeed.toFixed(2),
        minSpeed: Math.min(...speeds).toFixed(2),
      })}`
    );

    // Determine movement state
    let newState: MovementState["state"];
    if (avgSpeed < 0.5 && maxSpeed < 2) {
      newState = "STATIONARY";
    } else if (avgSpeed < 3 && maxSpeed < 5) {
      newState = "SLOW_MOVING";
    } else {
      newState = "FAST_MOVING";
    }

    // Update current state
    const wasStateChange = this.currentMovementState.state !== newState;
    this.currentMovementState = {
      state: newState,
      speed: avgSpeed,
      confidence: 0.8,
    };

    if (wasStateChange) {
      console.log(
        `✅ State transition: ${this.currentMovementState.state} → ${newState}`
      );
    }

    return this.currentMovementState;
  }

  /**
   * Calculate speed between two locations (km/h)
   */
  private static calculateSpeed(
    prev: Location.LocationObject,
    curr: Location.LocationObject
  ): number {
    const distance = this.calculateDistance(
      prev.coords.latitude,
      prev.coords.longitude,
      curr.coords.latitude,
      curr.coords.longitude
    );

    const timeDiff = (curr.timestamp - prev.timestamp) / 1000 / 3600; // hours
    return timeDiff > 0 ? distance / timeDiff : 0;
  }

  /**
   * Calculate distance between two coordinates (km)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Handle visit detection and management
   */
  private static async handleVisitDetection(
    location: Location.LocationObject,
    movementState: MovementState
  ) {
    if (movementState.state === "STATIONARY") {
      // Start or update pending visit
      if (!this.pendingVisit) {
        console.log("🏁 Starting new visit detection...");
        this.pendingVisit = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          startTime: new Date().toISOString(),
          locations: [location],
        };
      } else {
        // Update existing visit
        this.pendingVisit.locations.push(location);
        console.log("📍 Updated existing pending visit");
      }
    } else {
      // Movement detected - finalize visit if exists
      if (this.pendingVisit) {
        await this.finalizeVisit(this.pendingVisit);
        this.pendingVisit = null;
      }
    }
  }

  /**
   * Finalize and save a visit
   */
  private static async finalizeVisit(visitData: any) {
    try {
      const duration =
        (new Date().getTime() - new Date(visitData.startTime).getTime()) /
        1000 /
        60; // minutes

      if (duration < 0.5) {
        // Less than 30 seconds
        console.log("⏭️ Visit too short, skipping...");
        return;
      }

      console.log(
        `🏁 Visit ended, finalizing visit of ${duration.toFixed(1)} minutes`
      );
      console.log("🎯 Finalizing visit with enhanced geocoding...");

      // Get address for the visit
      const address = await GlobalGeocodingService.getBestGeocodingResult(
        visitData.latitude,
        visitData.longitude
      );

      const visit: Visit = {
        id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        placeName: address?.place || "Unknown Place",
        address: address?.value || "Unknown Address",
        latitude: visitData.latitude,
        longitude: visitData.longitude,
        startTime: visitData.startTime,
        endTime: new Date().toISOString(),
        duration: Math.round(duration),
        type: duration < 2 ? "brief" : duration < 15 ? "short" : "extended",
        confidence: address?.confidence || "low",
      };

      // Save visit locally
      await this.saveVisitLocally(visit);

      // Try to send to backend
      if (this.authToken) {
        await this.sendVisitToBackend(visit);
      } else {
        await this.storeVisitForRetry(visit);
      }

      console.log(
        `✅ Visit finalized: ${JSON.stringify({
          place: visit.placeName,
          duration: `${visit.duration}min`,
          type: visit.type,
          confidence: visit.confidence,
        })}`
      );

      console.log(`🏪 Visit detected: ${visit.placeName} (${visit.type})`);
    } catch (error) {
      console.error("❌ Error finalizing visit:", error);
    }
  }

  /**
   * Send visit to backend API
   */
  private static async sendVisitToBackend(visit: Visit) {
    try {
      if (!this.authToken) {
        throw new Error("No authentication token available");
      }

      console.log("📤 [BACKGROUND] Sending visit to backend...");

      const response = await fetch(`${this.BASE_URL}/api/visits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(visit),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [BACKGROUND] Visit sent to backend:", result.id);
      } else {
        console.error(
          `❌ [BACKGROUND] Failed to send visit: ${response.status}`
        );
        await this.storeVisitForRetry(visit);
      }
    } catch (error) {
      console.error("❌ [BACKGROUND] Error sending visit to backend:", error);
      await this.storeVisitForRetry(visit);
      console.log("💾 Stored pending visit request for retry");
      console.log(`⏳ Visit queued for retry: ${visit.placeName}`);
    }
  }

  /**
   * Store visit locally in AsyncStorage
   */
  private static async saveVisitLocally(visit: Visit) {
    try {
      const visits = await AsyncStorage.getItem("localVisits");
      const visitList = visits ? JSON.parse(visits) : [];
      visitList.push(visit);

      // Keep only last 100 visits
      if (visitList.length > 100) {
        visitList.splice(0, visitList.length - 100);
      }

      await AsyncStorage.setItem("localVisits", JSON.stringify(visitList));
      console.log(
        `💾 Visit saved to local storage (total: ${visitList.length})`
      );
    } catch (error) {
      console.error("❌ Error saving visit locally:", error);
    }
  }

  /**
   * Store visit for retry when network/auth is available
   */
  private static async storeVisitForRetry(visit: Visit) {
    try {
      const pendingVisits = await AsyncStorage.getItem("pendingVisits");
      const visits = pendingVisits ? JSON.parse(pendingVisits) : [];
      visits.push({
        ...visit,
        queuedAt: new Date().toISOString(),
        retryCount: 0,
      });
      await AsyncStorage.setItem("pendingVisits", JSON.stringify(visits));
    } catch (error) {
      console.error("❌ Error storing visit for retry:", error);
    }
  }

  /**
   * Store location data locally
   */
  private static async storeLocationLocally(
    location: Location.LocationObject,
    movementState: MovementState
  ) {
    try {
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
        movementState: movementState.state,
        speed: movementState.speed || 0,
      };

      const locations = await AsyncStorage.getItem("locationHistory");
      const locationList = locations ? JSON.parse(locations) : [];
      locationList.push(locationData);

      // Keep only last 1000 locations
      if (locationList.length > 1000) {
        locationList.splice(0, locationList.length - 1000);
      }

      await AsyncStorage.setItem(
        "locationHistory",
        JSON.stringify(locationList)
      );
      console.log("💾 Location stored");
    } catch (error) {
      console.error("❌ Error storing location:", error);
    }
  }

  /**
   * Retry sending pending visits
   */
  static async retryPendingVisits() {
    try {
      if (!this.authToken) {
        console.log("⚠️ No auth token available for retry");
        return;
      }

      const pendingVisits = await AsyncStorage.getItem("pendingVisits");
      if (!pendingVisits) {
        return;
      }

      const visits = JSON.parse(pendingVisits);
      const remainingVisits = [];

      for (const visit of visits) {
        try {
          await this.sendVisitToBackend(visit);
        } catch (error) {
          visit.retryCount = (visit.retryCount || 0) + 1;
          if (visit.retryCount < 3) {
            remainingVisits.push(visit);
          }
        }
      }

      await AsyncStorage.setItem(
        "pendingVisits",
        JSON.stringify(remainingVisits)
      );
      console.log(
        `🔄 Retried pending visits, ${remainingVisits.length} remaining`
      );
    } catch (error) {
      console.error("❌ Error retrying pending visits:", error);
    }
  }
}
