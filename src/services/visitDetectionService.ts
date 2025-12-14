import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalGeocodingService } from "./geocodingService";

interface LocationVisit {
  id: string;
  place: string;
  address: string;
  latitude: number;
  longitude: number;
  arrivalTime: number;
  departureTime?: number;
  duration?: number;
  confidence: "high" | "medium" | "low";
  source: "expo" | "openmaps" | "combined";
  visitType: "confirmed" | "potential" | "brief";
  metadata: {
    maxSpeed: number;
    minSpeed: number;
    averageSpeed: number;
    stationaryDuration: number;
  };
}

interface PendingVisit {
  latitude: number;
  longitude: number;
  firstDetectedTime: number;
  lastUpdateTime: number;
  speedSamples: number[];
  locationSamples: { lat: number; lng: number; timestamp: number }[];
}

export class VisitDetectionService {
  private static readonly STORAGE_KEY = "locationVisits";
  private static readonly PENDING_VISIT_KEY = "pendingLocationVisit";

  // Visit detection thresholds
  private static readonly MIN_VISIT_DURATION_MS = 60 * 1000; // 1 minute
  private static readonly SLOW_SPEED_THRESHOLD = 1.0; // km/h
  private static readonly STATIONARY_RADIUS = 50; // meters
  private static readonly MAX_VISIT_GAP_MS = 5 * 60 * 1000; // 5 minutes gap to close visit

  /**
   * Process location update for visit detection
   */
  static async processLocationForVisit(
    latitude: number,
    longitude: number,
    speed: number,
    movementState: string,
    timestamp: number = Date.now()
  ): Promise<LocationVisit | null> {
    try {
      console.log(
        `🔍 Visit detection: ${movementState}, speed: ${speed.toFixed(2)} km/h`
      );

      const pendingVisit = await this.getPendingVisit();

      // Handle visit detection for all movement states
      switch (movementState) {
        case "FAST_MOVING":
          // Check if user is slowing down in FAST_MOVING state
          if (speed <= this.SLOW_SPEED_THRESHOLD) {
            return await this.handleSlowingDown(
              latitude,
              longitude,
              speed,
              timestamp,
              pendingVisit
            );
          }
          // Check if user is moving fast again (end visit)
          if (speed > this.SLOW_SPEED_THRESHOLD && pendingVisit) {
            return await this.handleVisitEnd(timestamp, pendingVisit);
          }
          break;

        case "SLOW_MOVING":
          // In slow moving, continue tracking if user stays in area
          if (pendingVisit) {
            return await this.handleContinuedSlowMovement(
              latitude,
              longitude,
              speed,
              timestamp,
              pendingVisit
            );
          } else if (speed <= this.SLOW_SPEED_THRESHOLD) {
            // Start new visit if speed drops
            return await this.handleSlowingDown(
              latitude,
              longitude,
              speed,
              timestamp,
              null
            );
          }
          break;

        case "STATIONARY":
          // In stationary state, always track as potential visit
          if (pendingVisit) {
            return await this.handleContinuedSlowMovement(
              latitude,
              longitude,
              speed,
              timestamp,
              pendingVisit
            );
          } else {
            // Start new visit for stationary state
            return await this.handleSlowingDown(
              latitude,
              longitude,
              speed,
              timestamp,
              null
            );
          }
          break;
      }

      return null;
    } catch (error) {
      console.error("❌ Error processing location for visit:", error);
      return null;
    }
  }

  /**
   * Handle when user starts slowing down in FAST_MOVING state
   */
  private static async handleSlowingDown(
    latitude: number,
    longitude: number,
    speed: number,
    timestamp: number,
    existingPendingVisit: PendingVisit | null
  ): Promise<LocationVisit | null> {
    try {
      // Check if this is near an existing pending visit
      if (existingPendingVisit) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          existingPendingVisit.latitude,
          existingPendingVisit.longitude
        );

        if (distance <= this.STATIONARY_RADIUS) {
          // Update existing pending visit
          existingPendingVisit.lastUpdateTime = timestamp;
          existingPendingVisit.speedSamples.push(speed);
          existingPendingVisit.locationSamples.push({
            lat: latitude,
            lng: longitude,
            timestamp,
          });

          // Keep only last 10 samples
          if (existingPendingVisit.speedSamples.length > 10) {
            existingPendingVisit.speedSamples =
              existingPendingVisit.speedSamples.slice(-10);
          }
          if (existingPendingVisit.locationSamples.length > 10) {
            existingPendingVisit.locationSamples =
              existingPendingVisit.locationSamples.slice(-10);
          }

          await this.savePendingVisit(existingPendingVisit);
          console.log(
            `📍 Updated existing pending visit (${distance.toFixed(
              0
            )}m from center)`
          );
          return null;
        } else {
          // Too far from existing visit, finalize it and start new one
          const completedVisit = await this.handleVisitEnd(
            timestamp,
            existingPendingVisit
          );
          // Start new pending visit below
        }
      }

      // Create new pending visit
      const newPendingVisit: PendingVisit = {
        latitude,
        longitude,
        firstDetectedTime: timestamp,
        lastUpdateTime: timestamp,
        speedSamples: [speed],
        locationSamples: [{ lat: latitude, lng: longitude, timestamp }],
      };

      await this.savePendingVisit(newPendingVisit);
      console.log(
        `🚩 Started new pending visit at ${latitude.toFixed(
          6
        )}, ${longitude.toFixed(6)}`
      );

      return null;
    } catch (error) {
      console.error("❌ Error handling slowing down:", error);
      return null;
    }
  }

  /**
   * Handle continued slow movement or stationary state
   */
  private static async handleContinuedSlowMovement(
    latitude: number,
    longitude: number,
    speed: number,
    timestamp: number,
    pendingVisit: PendingVisit
  ): Promise<LocationVisit | null> {
    try {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        pendingVisit.latitude,
        pendingVisit.longitude
      );

      if (distance <= this.STATIONARY_RADIUS) {
        // Update pending visit
        pendingVisit.lastUpdateTime = timestamp;
        pendingVisit.speedSamples.push(speed);
        pendingVisit.locationSamples.push({
          lat: latitude,
          lng: longitude,
          timestamp,
        });

        // Keep only recent samples
        if (pendingVisit.speedSamples.length > 20) {
          pendingVisit.speedSamples = pendingVisit.speedSamples.slice(-20);
        }
        if (pendingVisit.locationSamples.length > 20) {
          pendingVisit.locationSamples =
            pendingVisit.locationSamples.slice(-20);
        }

        const durationMs = timestamp - pendingVisit.firstDetectedTime;

        // Check if visit duration threshold is met
        if (durationMs >= this.MIN_VISIT_DURATION_MS) {
          console.log(
            `✅ Visit duration threshold met: ${(
              durationMs /
              1000 /
              60
            ).toFixed(1)} minutes`
          );
          return await this.finalizeVisit(pendingVisit, timestamp);
        } else {
          await this.savePendingVisit(pendingVisit);
          console.log(
            `⏳ Pending visit duration: ${(durationMs / 1000).toFixed(0)}s / ${
              this.MIN_VISIT_DURATION_MS / 1000
            }s`
          );
        }
      } else {
        // Moved too far from pending visit location, cancel it
        console.log(
          `❌ Moved too far from pending visit (${distance.toFixed(
            0
          )}m), canceling`
        );
        await this.clearPendingVisit();
      }

      return null;
    } catch (error) {
      console.error("❌ Error handling continued slow movement:", error);
      return null;
    }
  }

  /**
   * Handle when visit ends (user starts moving fast again)
   */
  private static async handleVisitEnd(
    timestamp: number,
    pendingVisit: PendingVisit
  ): Promise<LocationVisit | null> {
    try {
      const durationMs = timestamp - pendingVisit.firstDetectedTime;

      if (durationMs >= this.MIN_VISIT_DURATION_MS) {
        console.log(
          `🏁 Visit ended, finalizing visit of ${(
            durationMs /
            1000 /
            60
          ).toFixed(1)} minutes`
        );
        return await this.finalizeVisit(pendingVisit, timestamp);
      } else {
        console.log(
          `❌ Visit too short (${(durationMs / 1000).toFixed(0)}s), discarding`
        );
        await this.clearPendingVisit();
        return null;
      }
    } catch (error) {
      console.error("❌ Error handling visit end:", error);
      return null;
    }
  }

  /**
   * Finalize a visit by getting enhanced geocoding and creating visit record
   */
  private static async finalizeVisit(
    pendingVisit: PendingVisit,
    endTimestamp: number
  ): Promise<LocationVisit | null> {
    try {
      console.log(`🎯 Finalizing visit with enhanced geocoding...`);

      // Calculate visit center (average of location samples)
      const centerLat =
        pendingVisit.locationSamples.reduce((sum, loc) => sum + loc.lat, 0) /
        pendingVisit.locationSamples.length;
      const centerLng =
        pendingVisit.locationSamples.reduce((sum, loc) => sum + loc.lng, 0) /
        pendingVisit.locationSamples.length;

      // Get enhanced geocoding result using the best method
      const geocodingResult =
        await GlobalGeocodingService.getBestGeocodingResult(
          centerLat,
          centerLng
        );

      if (!geocodingResult) {
        console.error("❌ Failed to get geocoding result for visit");
        await this.clearPendingVisit();
        return null;
      }

      // Calculate visit statistics
      const duration = endTimestamp - pendingVisit.firstDetectedTime;
      const maxSpeed = Math.max(...pendingVisit.speedSamples);
      const minSpeed = Math.min(...pendingVisit.speedSamples);
      const averageSpeed =
        pendingVisit.speedSamples.reduce((sum, speed) => sum + speed, 0) /
        pendingVisit.speedSamples.length;

      // Determine visit type based on duration and movement
      let visitType: LocationVisit["visitType"] = "potential";
      if (duration >= 5 * 60 * 1000 && averageSpeed < 0.5) {
        // 5+ minutes, very slow
        visitType = "confirmed";
      } else if (duration >= 2 * 60 * 1000) {
        // 2+ minutes
        visitType = "potential";
      } else {
        visitType = "brief";
      }

      // Create visit record
      const visit: LocationVisit = {
        id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        place: geocodingResult.place,
        address: geocodingResult.value,
        latitude: centerLat,
        longitude: centerLng,
        arrivalTime: pendingVisit.firstDetectedTime,
        departureTime: endTimestamp,
        duration,
        confidence: geocodingResult.confidence,
        source: geocodingResult.source,
        visitType,
        metadata: {
          maxSpeed,
          minSpeed,
          averageSpeed,
          stationaryDuration: duration,
        },
      };

      // Save the visit
      await this.saveVisit(visit);
      await this.clearPendingVisit();

      console.log(`✅ Visit finalized:`, {
        place: visit.place,
        duration: `${(duration / 1000 / 60).toFixed(1)}min`,
        type: visit.visitType,
        confidence: visit.confidence,
        source: visit.source,
      });

      return visit;
    } catch (error) {
      console.error("❌ Error finalizing visit:", error);
      await this.clearPendingVisit();
      return null;
    }
  }

  /**
   * Storage methods
   */
  private static async getPendingVisit(): Promise<PendingVisit | null> {
    try {
      const data = await AsyncStorage.getItem(this.PENDING_VISIT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("❌ Error getting pending visit:", error);
      return null;
    }
  }

  private static async savePendingVisit(visit: PendingVisit): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PENDING_VISIT_KEY, JSON.stringify(visit));
    } catch (error) {
      console.error("❌ Error saving pending visit:", error);
    }
  }

  private static async clearPendingVisit(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PENDING_VISIT_KEY);
    } catch (error) {
      console.error("❌ Error clearing pending visit:", error);
    }
  }

  private static async saveVisit(visit: LocationVisit): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const visits: LocationVisit[] = existingData
        ? JSON.parse(existingData)
        : [];

      visits.push(visit);

      // Keep only last 100 visits to prevent storage bloat
      if (visits.length > 100) {
        visits.splice(0, visits.length - 100);
      }

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(visits));
      console.log(`💾 Visit saved to local storage (total: ${visits.length})`);
    } catch (error) {
      console.error("❌ Error saving visit:", error);
    }
  }

  /**
   * Utility methods
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Public API methods for retrieving visits
   */
  static async getAllVisits(): Promise<LocationVisit[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("❌ Error getting all visits:", error);
      return [];
    }
  }

  static async getVisitsSince(timestamp: number): Promise<LocationVisit[]> {
    try {
      const allVisits = await this.getAllVisits();
      return allVisits.filter((visit) => visit.arrivalTime >= timestamp);
    } catch (error) {
      console.error("❌ Error getting visits since timestamp:", error);
      return [];
    }
  }

  static async clearAllVisits(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await this.clearPendingVisit();
      console.log("🗑️ All visits cleared");
    } catch (error) {
      console.error("❌ Error clearing all visits:", error);
    }
  }

  static async getCurrentPendingVisit(): Promise<PendingVisit | null> {
    return await this.getPendingVisit();
  }
}
