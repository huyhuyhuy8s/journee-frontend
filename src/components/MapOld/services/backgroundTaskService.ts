import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {LocationData, MovementAnalysis} from "@/components/Map/utils/types";
import {calculateDistance, getIntervalText} from "@/components/Map/utils/locationUtils";
import {StorageService} from "@/components/Map/services/storageService";
import {BACKGROUND_LOCATION_TASK, MOVEMENT_STATES, STATE_STABILITY_CONFIG} from "@/components/Map/utils/constants";
import {VisitDetectionService} from "@/services/visitDetectionService";
import {GlobalGeocodingService} from "@/services/geocodingService";
import {validateStateChange} from "@/components/Map/utils/validators";
import {BackendApiServices} from "@/services/backendApiServices";
import {getActivityType, getNotificationColor} from "@/components/Map/utils/movementStateUtils";

interface StateSpecificData {
  lastLocationCheck: number;
  speedSamples: number[];
  locationSamples: {
    lat: number;
    lng: number;
    timestamp: number;
    speed: number;
  }[];
  continuousMonitoringStart?: number;
  currentPhase: "waiting" | "monitoring" | "finalizing";
}

export class BackgroundTaskService {
  private static readonly BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  private static readonly BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "https://journee-1gt3.onrender.com";

  private static cachedToken: string | null = null;
  private static tokenRefreshPromise: Promise<string | null> | null = null;
  private static lastTokenRefresh: number = 0;
  private static readonly TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // State-specific distance thresholds
  private static readonly SLOW_MOVING_FAR_THRESHOLD = 4000; // 4km
  private static readonly STATIONARY_NEAR_THRESHOLD = 1000; // 1km
  private static readonly STATIONARY_FAR_THRESHOLD = 4000; // 4km

  // Monitoring durations
  private static readonly SPEED_MONITORING_DURATION = 60 * 1000; // 1 minute
  private static readonly SLOW_MOVING_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private static readonly STATIONARY_INTERVAL = 60 * 60 * 1000; // 1 hour

  static async initializeTokenCache(token: string): Promise<void> {
    try {
      this.cachedToken = token;
      this.lastTokenRefresh = Date.now();

      // Store in multiple locations for background access
      await Promise.all([
        AsyncStorage.setItem("backgroundAuthToken", token),
        AsyncStorage.setItem("authToken", token),
      ]);

      console.log("✅ [AUTH] Token cache initialized for background tasks");
    } catch (error) {
      console.error("❌ [AUTH] Error initializing token cache:", error);
    }
  }

  static async analyzeMovement(
    currentLocation: Location.LocationObject,
    previousLocation: Location.LocationObject | null
  ): Promise<MovementAnalysis> {
    let currentSpeed = 0;
    let distanceTraveled = 0;
    let timeDelta = 0;

    if (previousLocation) {
      timeDelta =
        (currentLocation.timestamp - previousLocation.timestamp) / 1000;
      distanceTraveled = calculateDistance(
        previousLocation.coords.latitude,
        previousLocation.coords.longitude,
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      if (timeDelta > 0) {
        currentSpeed = (distanceTraveled / timeDelta) * 3.6;
      }
    }

    if (currentLocation.coords.speed && currentLocation.coords.speed >= 0) {
      const gpsSpeed = currentLocation.coords.speed * 3.6;
      currentSpeed = Math.max(currentSpeed, gpsSpeed);
    }

    return {
      currentSpeed: Math.max(0, currentSpeed),
      distanceTraveled: Math.max(0, distanceTraveled),
      timeDelta: Math.max(0, timeDelta),
    };
  }

  static async handleBackgroundLocation(
    location: Location.LocationObject
  ): Promise<void> {
    try {
      console.log("🔄 Processing background location...");

      const token = await this.getAuthToken();
      if (!token) {
        console.warn(
          "⚠️ No auth token available, skipping location processing."
        );
      }

      const [
        lastLocationStr,
        lastMovementState,
        stateChangeTimeStr,
        stabilityBufferStr,
        stateDataStr,
      ] = await Promise.all([
        StorageService.getStorageValue("LAST_LOCATION"),
        StorageService.getStorageValue("MOVEMENT_STATE"),
        StorageService.getStorageValue("STATE_CHANGE_TIME"),
        StorageService.getStorageValue("STATE_STABILITY_BUFFER"),
        AsyncStorage.getItem("stateSpecificData"),
      ]);

      let previousLocation: Location.LocationObject | null = null;
      if (lastLocationStr) {
        previousLocation = JSON.parse(lastLocationStr);
      }

      const currentState = lastMovementState || "FAST_MOVING";
      let stateChangeTime = stateChangeTimeStr
        ? parseInt(stateChangeTimeStr)
        : Date.now();
      let speedBuffer: number[] = stabilityBufferStr
        ? JSON.parse(stabilityBufferStr)
        : [];
      let stateData: StateSpecificData = stateDataStr
        ? JSON.parse(stateDataStr)
        : {
          lastLocationCheck: Date.now(),
          speedSamples: [],
          locationSamples: [],
          currentPhase: "waiting",
        };

      const movementAnalysis = await this.analyzeMovement(
        location,
        previousLocation
      );

      // Handle state-specific logic
      const stateTransitionResult = await this.handleStateSpecificLogic(
        location,
        movementAnalysis,
        currentState,
        previousLocation,
        stateData
      );

      let finalState = stateTransitionResult.newState;
      let shouldUpdateStateChangeTime = stateTransitionResult.stateChanged;
      stateData = stateTransitionResult.updatedStateData;

      // Update state change time if state changed
      if (shouldUpdateStateChangeTime) {
        stateChangeTime = Date.now();
        console.log(`✅ State transition: ${currentState} → ${finalState}`);
      }

      // Update speed buffer for general tracking
      speedBuffer.push(movementAnalysis.currentSpeed);
      if (speedBuffer.length > STATE_STABILITY_CONFIG.SAMPLE_BUFFER_SIZE) {
        speedBuffer = speedBuffer.slice(
          -STATE_STABILITY_CONFIG.SAMPLE_BUFFER_SIZE
        );
      }

      const averageSpeed =
        speedBuffer.reduce((sum, speed) => sum + speed, 0) / speedBuffer.length;
      const timeSinceLastChange = Date.now() - stateChangeTime;

      // Process location for visit detection (for all states)
      try {
        const detectedVisit =
          await VisitDetectionService.processLocationForVisit(
            location.coords.latitude,
            location.coords.longitude,
            movementAnalysis.currentSpeed,
            finalState,
            location.timestamp
          );

        if (detectedVisit) {
          console.log(
            `🏪 Visit detected: ${detectedVisit.place} (${detectedVisit.visitType})`
          );

          // 🆕 Enhanced visit sending with better error handling
          await this.sendVisitToBackendSafely(detectedVisit);
        }
      } catch (visitError) {
        console.error("❌ Error in visit detection:", visitError);
      }

      // Save all data
      await Promise.all([
        StorageService.setStorageValue(
          "LAST_LOCATION",
          JSON.stringify(location)
        ),
        StorageService.setStorageValue("MOVEMENT_STATE", finalState),
        StorageService.setStorageValue(
          "STATE_CHANGE_TIME",
          stateChangeTime.toString()
        ),
        StorageService.setStorageValue(
          "STATE_STABILITY_BUFFER",
          JSON.stringify(speedBuffer)
        ),
        StorageService.setStorageValue("LAST_SPEED", averageSpeed.toString()),
        AsyncStorage.setItem("stateSpecificData", JSON.stringify(stateData)),
      ]);

      // Update UI data
      await StorageService.updateUIData({
        movementState: finalState,
        currentSpeed: movementAnalysis.currentSpeed,
        averageSpeed,
        timeSinceStateChange: timeSinceLastChange,
        timestamp: Date.now(),
      });

      // Restart tracking with correct interval based on final state
      const newState =
        Object.values(MOVEMENT_STATES).find((s) => s.name === finalState) ||
        MOVEMENT_STATES.FAST_MOVING;
      await this.restartBackgroundTrackingWithNewInterval(newState);

      // Store location data
      const locationData: LocationData = {
        ...location,
        movementState: finalState,
        speed: movementAnalysis.currentSpeed,
        averageSpeed,
        timeSinceStateChange: timeSinceLastChange,
      };
      await StorageService.storeLocationData(locationData);
    } catch (error) {
      console.error("❌ Error handling background location:", error);

      // 🆕 Don't let background errors crash the app-old
      try {
        await this.handleBackgroundError(error, location);
      } catch (recoveryError) {
        console.error("❌ Error in background error recovery:", recoveryError);
      }
    }
  }

  static setCachedToken(token: string): void {
    this.cachedToken = token;
  }

  static async clearTokenCache(): Promise<void> {
    try {
      this.cachedToken = null;
      this.lastTokenRefresh = 0;
      this.tokenRefreshPromise = null;

      await AsyncStorage.multiRemove([
        "backgroundAuthToken",
        "authToken",
        "userToken",
        "@journee/authToken",
      ]);

      console.log("✅ [AUTH] Token cache cleared");
    } catch (error) {
      console.error("❌ [AUTH] Error clearing token cache:", error);
    }
  }

  static async createVisit(visitData: any): Promise<any> {
    try {
      const token = await this.getAuthToken();

      if (!token) {
        // 🆕 Instead of throwing error, queue for retry
        console.warn(
          "⚠️ [BACKEND] No token for visit creation, queuing for retry"
        );
        await this.queuePendingRequest("visits", "POST", visitData);
        return {queued: true};
      }

      console.log(
        "📤 [BACKEND] Creating visit...",
        JSON.stringify(visitData, null, 2)
      );

      const response = await fetch(`${this.BASE_URL}/api/visits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(visitData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [BACKEND] Visit created successfully:", result);
        return result;
      } else {
        const errorText = await response.text();
        console.error(
          `❌ [BACKEND] Visit creation failed: ${response.status} ${errorText}`
        );

        // Queue for retry if it's a temporary error
        if (response.status >= 500 || response.status === 401) {
          await this.queuePendingRequest("visits", "POST", visitData);
        }

        throw new Error(`Visit creation failed: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ [BACKEND] Error creating visit:", error);

      // Queue for retry on network errors
      await this.queuePendingRequest("visits", "POST", visitData);
      throw error;
    }
  }

  static async getPendingRequestsCount(): Promise<number> {
    try {
      const pendingRequests =
        (await AsyncStorage.getItem("pendingRequests")) || "[]";
      const requests = JSON.parse(pendingRequests);
      return requests.length;
    } catch (error) {
      console.error("❌ [BACKEND] Error getting pending count:", error);
      return 0;
    }
  }

  static async retryPendingRequests(): Promise<void> {
    try {
      const token = await this.getAuthToken();

      if (!token) {
        console.warn("⚠️ [BACKEND] No token available for retry, skipping");
        return;
      }

      const pendingRequests =
        (await AsyncStorage.getItem("pendingRequests")) || "[]";
      const requests = JSON.parse(pendingRequests);

      if (requests.length === 0) {
        console.log("ℹ️ [BACKEND] No pending requests to retry");
        return;
      }

      console.log(
        `🔄 [BACKEND] Retrying ${requests.length} pending requests...`
      );

      const successfulRequests: string[] = [];

      for (const request of requests) {
        try {
          const response = await fetch(
            `${this.BASE_URL}/api/${request.endpoint}`,
            {
              method: request.method,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(request.data),
            }
          );

          if (response.ok) {
            console.log(
              `✅ [BACKEND] Retry successful for ${request.endpoint}`
            );
            successfulRequests.push(request.id);
          } else {
            console.error(
              `❌ [BACKEND] Retry failed for ${request.endpoint}: ${response.status}`
            );

            // Remove request if it's been failing for too long or is a permanent error
            if (
              request.retries > 5 ||
              (response.status >= 400 && response.status < 500)
            ) {
              successfulRequests.push(request.id);
            } else {
              request.retries = (request.retries || 0) + 1;
            }
          }
        } catch (error) {
          console.error(
            `❌ [BACKEND] Error retrying ${request.endpoint}:`,
            error
          );
          request.retries = (request.retries || 0) + 1;

          // Remove if too many retries
          if (request.retries > 5) {
            successfulRequests.push(request.id);
          }
        }
      }

      // Remove successful/failed requests
      const remainingRequests = requests.filter(
        (req: any) => !successfulRequests.includes(req.id)
      );

      await AsyncStorage.setItem(
        "pendingRequests",
        JSON.stringify(remainingRequests)
      );

      console.log(
        `✅ [BACKEND] Retry complete: ${successfulRequests.length} processed, ${remainingRequests.length} remaining`
      );
    } catch (error) {
      console.error("❌ [BACKEND] Error during retry:", error);
    }
  }

  static async sendLocationUpdateToBackend(locationData: any): Promise<void> {
    try {
      if (!this.BACKEND_URL) {
        console.warn("⚠️ Backend URL not configured");
        return;
      }

      const response = await fetch(`${this.BACKEND_URL}/api/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
        },
        body: JSON.stringify({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          enhancedPlace: locationData.enhancedPlace,
          enhancedAddress: locationData.enhancedAddress,
          geocodingSource: locationData.geocodingSource,
          geocodingConfidence: locationData.geocodingConfidence,
          timestamp: locationData.timestamp,
          accuracy: locationData.coords.accuracy,
          speed: locationData.coords.speed,
        }),
      });

      if (response.ok) {
        console.log("✅ Location update sent to backend");
      } else {
        console.error(
          `❌ Failed to send location update to backend: ${response.status}`
        );
      }
    } catch (error) {
      console.error("❌ Error sending location update to backend:", error);
    }
  }

  static async sendVisitToBackend(visit: any): Promise<void> {
    try {
      const success = await BackendApiServices.sendVisit({
        id: visit.id,
        place: visit.place,
        address: visit.address,
        latitude: visit.latitude,
        longitude: visit.longitude,
        arrivalTime: visit.arrivalTime,
        departureTime: visit.departureTime,
        duration: visit.duration,
        confidence: visit.confidence,
        source: visit.source,
        visitType: visit.visitType,
        metadata: visit.metadata,
      });

      if (success) {
        console.log(`✅ Visit sent to backend: ${visit.place}`);
      } else {
        console.log(`⏳ Visit queued for retry: ${visit.place}`);
      }
    } catch (error) {
      console.error("❌ Error sending visit to backend:", error);
    }
  }

  static async startBackgroundTracking(): Promise<boolean> {
    try {
      console.log("🌙 Starting background tracking...");

      const isTaskDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
      if (!isTaskDefined) {
        console.error("❌ Task not defined");
        return false;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (hasStarted) {
        console.log("⚠️ Already started");
        return true;
      }

      const backgroundStatus = await Location.getBackgroundPermissionsAsync();
      if (backgroundStatus.status !== Location.PermissionStatus.GRANTED) {
        console.error("❌ Background permission required");
        return false;
      }

      await AsyncStorage.removeItem("currentTrackingConfig");
      const initialState = MOVEMENT_STATES.FAST_MOVING;

      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: initialState.accuracy,
        timeInterval: initialState.updateInterval,
        distanceInterval: initialState.distanceInterval,
        foregroundService: {
          notificationTitle: "Journey Tracker",
          notificationBody: `${initialState.name.replace(
            "_",
            " "
          )} - ${getIntervalText(initialState.updateInterval)} updates`,
          notificationColor: "#007AFF",
        },
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.Other,
      });

      await AsyncStorage.setItem(
        "currentTrackingConfig",
        JSON.stringify({
          name: initialState.name,
          updateInterval: initialState.updateInterval,
          distanceInterval: initialState.distanceInterval,
        })
      );

      // Initialize state-specific data
      const initialStateData: StateSpecificData = {
        lastLocationCheck: Date.now(),
        speedSamples: [],
        locationSamples: [],
        currentPhase: "waiting",
      };
      await AsyncStorage.setItem(
        "stateSpecificData",
        JSON.stringify(initialStateData)
      );

      console.log(`✅ Background tracking started with ${initialState.name}`);
      return true;
    } catch (error) {
      console.error("❌ Error starting tracking:", error);
      return false;
    }
  }

  static async stopBackgroundTracking(): Promise<void> {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }
      await StorageService.clearTrackingData();
      await AsyncStorage.removeItem("stateSpecificData");
      console.log("✅ Background tracking stopped");
    } catch (error) {
      console.error("❌ Error stopping tracking:", error);
    }
  }

  static async restartBackgroundTrackingWithNewInterval(
    newState: any
  ): Promise<void> {
    try {
      const currentConfig = await AsyncStorage.getItem("currentTrackingConfig");
      const newConfigStr = JSON.stringify({
        name: newState.name,
        updateInterval: newState.updateInterval,
        distanceInterval: newState.distanceInterval,
      });

      if (currentConfig === newConfigStr) {
        console.log(
          `⚡ Already using ${newState.name} configuration - no restart needed`
        );
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: newState.accuracy,
        timeInterval: newState.updateInterval,
        distanceInterval: newState.distanceInterval,
        foregroundService: {
          notificationTitle: "Journey Tracker",
          notificationBody: `${newState.name.replace(
            "_",
            " "
          )} - ${getIntervalText(newState.updateInterval)} updates`,
          notificationColor: getNotificationColor(newState.name),
        },
        deferredUpdatesInterval: newState.updateInterval,
        deferredUpdatesDistance: newState.distanceInterval,
        pausesUpdatesAutomatically: false,
        activityType: getActivityType(newState.name),
      });

      await AsyncStorage.setItem("currentTrackingConfig", newConfigStr);
      console.log(`✅ Tracking restarted with ${newState.name}`);
    } catch (error) {
      console.error("❌ Error restarting tracking:", error);
    }
  }

  private static async getAuthToken(): Promise<string | null> {
    try {
      const now = Date.now();

      // Check if we have a recent cached token
      if (
        this.cachedToken &&
        now - this.lastTokenRefresh < this.TOKEN_REFRESH_INTERVAL
      ) {
        console.log("🔄 [AUTH] Using cached token (recent)");
        return this.cachedToken;
      }

      // Prevent multiple simultaneous token refreshes
      if (this.tokenRefreshPromise) {
        console.log("🔄 [AUTH] Waiting for ongoing token refresh...");
        return await this.tokenRefreshPromise;
      }

      // Start token refresh process
      this.tokenRefreshPromise = this.refreshTokenFromStorage();
      const token = await this.tokenRefreshPromise;
      this.tokenRefreshPromise = null;

      return token;
    } catch (error) {
      console.error("❌ [AUTH] Error in token management:", error);
      this.tokenRefreshPromise = null;
      return this.cachedToken; // Fallback to cached token
    }
  }

  private static async refreshTokenFromStorage(): Promise<string | null> {
    try {
      console.log("🔄 [AUTH] Refreshing token from storage...");

      // Try multiple storage keys for token
      const tokenSources = [
        "authToken",
        "userToken",
        "@journee/authToken",
        "auth_token",
      ];

      let token: string | null = null;

      for (const key of tokenSources) {
        try {
          const storedToken = await AsyncStorage.getItem(key);
          if (storedToken && storedToken.length > 20) {
            // Basic token validation
            token = storedToken;
            console.log(`✅ [AUTH] Token found in key: ${key}`);
            break;
          }
        } catch (error) {
          console.warn(`⚠️ [AUTH] Failed to read from ${key}:`, error);
        }
      }

      if (token) {
        // Update cache
        this.cachedToken = token;
        this.lastTokenRefresh = Date.now();

        // Store token in background-accessible location
        await AsyncStorage.setItem("backgroundAuthToken", token);
        console.log("✅ [AUTH] Token cached for background use");

        return token;
      }

      console.warn("⚠️ [AUTH] No valid token found in any storage location");
      return null;
    } catch (error) {
      console.error("❌ [AUTH] Error refreshing token:", error);
      return null;
    }
  }

  private static async queuePendingRequest(
    endpoint: string,
    method: string,
    data: any
  ): Promise<void> {
    try {
      const pendingRequests =
        (await AsyncStorage.getItem("pendingRequests")) || "[]";
      const requests = JSON.parse(pendingRequests);

      const newRequest = {
        id: Date.now().toString(),
        endpoint,
        method,
        data,
        timestamp: Date.now(),
        retries: 0,
      };

      requests.push(newRequest);
      await AsyncStorage.setItem("pendingRequests", JSON.stringify(requests));

      console.log("💾 [BACKEND] Stored pending request for retry");
    } catch (error) {
      console.error("❌ [BACKEND] Error queuing request:", error);
    }
  }

  /**
   * Handle state-specific logic for SLOW_MOVING and STATIONARY
   */
  private static async handleStateSpecificLogic(
    location: Location.LocationObject,
    movementAnalysis: MovementAnalysis,
    currentState: string,
    previousLocation: Location.LocationObject | null,
    stateData: StateSpecificData
  ): Promise<{
    newState: string;
    stateChanged: boolean;
    updatedStateData: StateSpecificData;
  }> {
    const now = Date.now();

    switch (currentState) {
      case "SLOW_MOVING":
        return await this.handleSlowMovingLogic(
          location,
          movementAnalysis,
          previousLocation,
          stateData,
          now
        );

      case "STATIONARY":
        return await this.handleStationaryLogic(
          location,
          movementAnalysis,
          previousLocation,
          stateData,
          now
        );

      default: // FAST_MOVING
        return await this.handleFastMovingLogic(
          location,
          movementAnalysis,
          previousLocation,
          stateData,
          now
        );
    }
  }

  /**
   * Handle SLOW_MOVING state logic
   */
  private static async handleSlowMovingLogic(
    location: Location.LocationObject,
    movementAnalysis: MovementAnalysis,
    previousLocation: Location.LocationObject | null,
    stateData: StateSpecificData,
    now: number
  ): Promise<{
    newState: string;
    stateChanged: boolean;
    updatedStateData: StateSpecificData;
  }> {
    const timeSinceLastCheck = now - stateData.lastLocationCheck;

    // Check if it's time for a 30-minute check or we're in monitoring phase
    if (
      stateData.currentPhase === "waiting" &&
      timeSinceLastCheck < this.SLOW_MOVING_INTERVAL
    ) {
      // Still waiting for the 30-minute interval
      return {
        newState: "SLOW_MOVING",
        stateChanged: false,
        updatedStateData: stateData,
      };
    }

    if (stateData.currentPhase === "waiting") {
      // Start the location check
      console.log("🚶 SLOW_MOVING: Starting 30-minute location check");

      if (previousLocation) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          previousLocation.coords.latitude,
          previousLocation.coords.longitude
        );

        console.log(
          `📏 SLOW_MOVING distance check: ${distance.toFixed(
            0
          )}m from last location`
        );

        if (distance >= this.SLOW_MOVING_FAR_THRESHOLD) {
          // User moved far away, switch to FAST_MOVING
          console.log(
            `🏃 SLOW_MOVING → FAST_MOVING: Moved ${distance.toFixed(0)}m (>${
              this.SLOW_MOVING_FAR_THRESHOLD
            }m)`
          );

          return {
            newState: "FAST_MOVING",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }
      }

      // Start 1-minute monitoring phase
      stateData.currentPhase = "monitoring";
      stateData.continuousMonitoringStart = now;
      stateData.speedSamples = [movementAnalysis.currentSpeed];
      stateData.locationSamples = [
        {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          timestamp: now,
          speed: movementAnalysis.currentSpeed,
        },
      ];

      console.log("⏱️ SLOW_MOVING: Starting 1-minute speed monitoring");
    }

    if (stateData.currentPhase === "monitoring") {
      // Continue monitoring for 1 minute
      const monitoringDuration =
        now - (stateData.continuousMonitoringStart || now);

      stateData.speedSamples.push(movementAnalysis.currentSpeed);
      stateData.locationSamples.push({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: now,
        speed: movementAnalysis.currentSpeed,
      });

      if (monitoringDuration >= this.SPEED_MONITORING_DURATION) {
        // Monitoring period complete, analyze results
        const averageSpeed =
          stateData.speedSamples.reduce((sum, speed) => sum + speed, 0) /
          stateData.speedSamples.length;

        console.log(
          `📊 SLOW_MOVING monitoring complete: avg speed ${averageSpeed.toFixed(
            2
          )} km/h over ${monitoringDuration / 1000}s`
        );

        if (averageSpeed < 1.0) {
          // Switch to STATIONARY
          console.log("📍 SLOW_MOVING → STATIONARY: Average speed < 1 km/h");

          // Get enhanced location data before switching
          await this.processFinalLocationUpdate(location);

          return {
            newState: "STATIONARY",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        } else {
          // Stay in SLOW_MOVING, process final location and wait for next cycle
          console.log("🚶 SLOW_MOVING: Staying in slow moving state");

          await this.processFinalLocationUpdate(location);

          return {
            newState: "SLOW_MOVING",
            stateChanged: false,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }
      }
    }

    return {
      newState: "SLOW_MOVING",
      stateChanged: false,
      updatedStateData: stateData,
    };
  }

  /**
   * Handle STATIONARY state logic
   */
  private static async handleStationaryLogic(
    location: Location.LocationObject,
    movementAnalysis: MovementAnalysis,
    previousLocation: Location.LocationObject | null,
    stateData: StateSpecificData,
    now: number
  ): Promise<{
    newState: string;
    stateChanged: boolean;
    updatedStateData: StateSpecificData;
  }> {
    const timeSinceLastCheck = now - stateData.lastLocationCheck;

    // Check if it's time for an hourly check or we're in monitoring phase
    if (
      stateData.currentPhase === "waiting" &&
      timeSinceLastCheck < this.STATIONARY_INTERVAL
    ) {
      // Still waiting for the hourly interval
      return {
        newState: "STATIONARY",
        stateChanged: false,
        updatedStateData: stateData,
      };
    }

    if (stateData.currentPhase === "waiting") {
      // Start the hourly location check
      console.log("📍 STATIONARY: Starting hourly location check");

      if (previousLocation) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          previousLocation.coords.latitude,
          previousLocation.coords.longitude
        );

        console.log(
          `📏 STATIONARY distance check: ${distance.toFixed(
            0
          )}m from last location`
        );

        if (distance >= this.STATIONARY_FAR_THRESHOLD) {
          // User moved very far away, switch to FAST_MOVING
          console.log(
            `🏃 STATIONARY → FAST_MOVING: Moved ${distance.toFixed(0)}m (>${
              this.STATIONARY_FAR_THRESHOLD
            }m)`
          );

          return {
            newState: "FAST_MOVING",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }

        if (distance >= this.STATIONARY_NEAR_THRESHOLD) {
          // User moved significantly, start monitoring
          console.log(
            `⏱️ STATIONARY: User moved ${distance.toFixed(
              0
            )}m, starting 1-minute monitoring`
          );

          stateData.currentPhase = "monitoring";
          stateData.continuousMonitoringStart = now;
          stateData.speedSamples = [movementAnalysis.currentSpeed];
          stateData.locationSamples = [
            {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              timestamp: now,
              speed: movementAnalysis.currentSpeed,
            },
          ];
        } else {
          // User hasn't moved much, process final location and continue waiting
          console.log(
            "📍 STATIONARY: No significant movement, continuing stationary state"
          );

          await this.processFinalLocationUpdate(location);

          return {
            newState: "STATIONARY",
            stateChanged: false,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }
      }
    }

    if (stateData.currentPhase === "monitoring") {
      // Continue monitoring for 1 minute
      const monitoringDuration =
        now - (stateData.continuousMonitoringStart || now);

      stateData.speedSamples.push(movementAnalysis.currentSpeed);
      stateData.locationSamples.push({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: now,
        speed: movementAnalysis.currentSpeed,
      });

      if (monitoringDuration >= this.SPEED_MONITORING_DURATION) {
        // Monitoring period complete, analyze results
        const averageSpeed =
          stateData.speedSamples.reduce((sum, speed) => sum + speed, 0) /
          stateData.speedSamples.length;

        console.log(
          `📊 STATIONARY monitoring complete: avg speed ${averageSpeed.toFixed(
            2
          )} km/h over ${monitoringDuration / 1000}s`
        );

        if (averageSpeed >= 5.0) {
          // Switch to FAST_MOVING
          console.log("🏃 STATIONARY → FAST_MOVING: Average speed ≥ 5 km/h");

          return {
            newState: "FAST_MOVING",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        } else if (averageSpeed >= 1.0) {
          // Switch to SLOW_MOVING
          console.log("🚶 STATIONARY → SLOW_MOVING: Average speed ≥ 1 km/h");

          return {
            newState: "SLOW_MOVING",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        } else {
          // Stay STATIONARY
          console.log("📍 STATIONARY: Staying stationary (avg speed < 1 km/h)");

          await this.processFinalLocationUpdate(location);

          return {
            newState: "STATIONARY",
            stateChanged: false,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }
      }
    }

    return {
      newState: "STATIONARY",
      stateChanged: false,
      updatedStateData: stateData,
    };
  }

  private static async handleFastMovingLogic(
    location: Location.LocationObject,
    movementAnalysis: MovementAnalysis,
    previousLocation: Location.LocationObject | null,
    stateData: StateSpecificData,
    now: number
  ): Promise<{
    newState: string;
    stateChanged: boolean;
    updatedStateData: StateSpecificData;
  }> {
    // Build longer speed buffer for more stable decisions
    const speedBuffer = stateData.speedSamples.slice(-15); // Use last 15 samples
    speedBuffer.push(movementAnalysis.currentSpeed);

    if (speedBuffer.length > 15) {
      speedBuffer.splice(0, speedBuffer.length - 15);
    }

    // 🆕 Require minimum samples before state change
    if (speedBuffer.length < 8) {
      console.log(
        `🔄 FAST_MOVING: Collecting samples (${speedBuffer.length}/8)`
      );
      return {
        newState: "FAST_MOVING",
        stateChanged: false,
        updatedStateData: {
          ...stateData,
          speedSamples: speedBuffer,
        },
      };
    }

    const averageSpeed =
      speedBuffer.reduce((sum, speed) => sum + speed, 0) / speedBuffer.length;
    const maxSpeed = Math.max(...speedBuffer);
    const minSpeed = Math.min(...speedBuffer);

    console.log(
      `🔍 FAST_MOVING analysis: avg=${averageSpeed.toFixed(
        2
      )}, max=${maxSpeed.toFixed(2)}, min=${minSpeed.toFixed(2)}`
    );

    // 🆕 More conservative thresholds for state changes
    let potentialNewState = "FAST_MOVING";

    // Only transition to STATIONARY if consistently very slow
    if (
      averageSpeed < 0.3 &&
      maxSpeed < 1.0 &&
      speedBuffer.every((speed) => speed < 2.0)
    ) {
      potentialNewState = "STATIONARY";
    }
    // Transition to SLOW_MOVING if moderately slow
    else if (averageSpeed < 2.0 && maxSpeed < 5.0) {
      potentialNewState = "SLOW_MOVING";
    }

    if (potentialNewState !== "FAST_MOVING") {
      console.log(
        `🔍 Considering transition FAST_MOVING → ${potentialNewState}`
      );

      // 🆕 Add time-based stability requirement
      const stateStabilityTime = 90000; // 1.5 minutes
      const timeInCurrentState = now - (stateData.lastLocationCheck || now);

      if (timeInCurrentState < stateStabilityTime) {
        console.log(
          `⏳ FAST_MOVING: Need ${(
            (stateStabilityTime - timeInCurrentState) /
            1000
          ).toFixed(0)}s more for stable transition`
        );
        return {
          newState: "FAST_MOVING",
          stateChanged: false,
          updatedStateData: {
            ...stateData,
            speedSamples: speedBuffer,
          },
        };
      }

      const isValidChange = await validateStateChange(
        "FAST_MOVING",
        potentialNewState,
        speedBuffer,
        averageSpeed
      );

      if (isValidChange) {
        console.log(
          `🔄 FAST_MOVING → ${potentialNewState}: Validated state change`
        );

        return {
          newState: potentialNewState,
          stateChanged: true,
          updatedStateData: {
            lastLocationCheck: now,
            speedSamples: speedBuffer,
            locationSamples: [],
            currentPhase: "waiting",
          },
        };
      } else {
        console.log(
          `❌ FAST_MOVING → ${potentialNewState}: Transition not validated`
        );
      }
    }

    return {
      newState: "FAST_MOVING",
      stateChanged: false,
      updatedStateData: {
        ...stateData,
        speedSamples: speedBuffer,
        lastLocationCheck: now, // Update last check time
      },
    };
  }

  private static async processFinalLocationUpdate(
    location: Location.LocationObject
  ): Promise<void> {
    try {
      console.log(
        "🎯 Processing final location update with enhanced geocoding"
      );

      const geocodingResult =
        await GlobalGeocodingService.getBestGeocodingResult(
          location.coords.latitude,
          location.coords.longitude
        );

      if (geocodingResult) {
        console.log(
          `✅ Enhanced location result: ${geocodingResult.place} (${geocodingResult.source})`
        );

        // Store enhanced location data locally
        const enhancedLocationData = {
          ...location,
          enhancedPlace: geocodingResult.place,
          enhancedAddress: geocodingResult.value,
          geocodingSource: geocodingResult.source,
          geocodingConfidence: geocodingResult.confidence,
          timestamp: Date.now(),
        };

        await AsyncStorage.setItem(
          "lastEnhancedLocation",
          JSON.stringify(enhancedLocationData)
        );

        // Send to backend
        const success = await BackendApiServices.sendLocationUpdate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          enhancedPlace: geocodingResult.place,
          enhancedAddress: geocodingResult.value,
          geocodingSource: geocodingResult.source,
          geocodingConfidence: geocodingResult.confidence,
          timestamp: location.timestamp,
          accuracy: location.coords.accuracy ?? undefined,
          speed: location.coords.speed,
          movementState:
            (await StorageService.getStorageValue("MOVEMENT_STATE")) ||
            "UNKNOWN",
        });

        if (success) {
          console.log("✅ Location update sent to backend successfully");
        } else {
          console.log("⏳ Location update queued for retry");
        }
      }
    } catch (error) {
      console.error("❌ Error processing final location update:", error);
    }
  }

  private static async sendVisitToBackendSafely(visit: any): Promise<void> {
    try {
      const token = await this.getAuthToken();

      if (!token) {
        console.warn("⚠️ [VISIT] No token available, queuing visit for later");
        await this.queuePendingRequest("visits", "POST", {
          id: visit.id,
          place: visit.place,
          address: visit.address,
          latitude: visit.latitude,
          longitude: visit.longitude,
          arrivalTime: visit.arrivalTime,
          departureTime: visit.departureTime,
          duration: visit.duration,
          confidence: visit.confidence,
          source: visit.source,
          visitType: visit.visitType,
          metadata: visit.metadata,
        });
        return;
      }

      // Try to send visit with token
      const success = await BackendApiServices.sendVisit({
        id: visit.id,
        place: visit.place,
        address: visit.address,
        latitude: visit.latitude,
        longitude: visit.longitude,
        arrivalTime: visit.arrivalTime,
        departureTime: visit.departureTime,
        duration: visit.duration,
        confidence: visit.confidence,
        source: visit.source,
        visitType: visit.visitType,
        metadata: visit.metadata,
      });

      if (success) {
        console.log(`✅ Visit sent to backend: ${visit.place}`);
      } else {
        console.log(`⏳ Visit queued for retry: ${visit.place}`);
      }
    } catch (error) {
      console.error("❌ Error sending visit to backend:", error);

      // Queue for retry
      await this.queuePendingRequest("visits", "POST", {
        id: visit.id,
        place: visit.place,
        // ... other visit properties
      });
    }
  }

  private static async handleBackgroundError(
    error: any,
    location?: Location.LocationObject
  ): Promise<void> {
    try {
      console.log("🔄 [RECOVERY] Handling background error...");

      // Log error details for debugging
      const errorDetails = {
        message: error.message || "Unknown error",
        stack: error.stack || "No stack trace",
        location: location
          ? {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            timestamp: location.timestamp,
          }
          : null,
        timestamp: Date.now(),
        authTokenAvailable: !!this.cachedToken,
      };

      await AsyncStorage.setItem(
        "lastBackgroundError",
        JSON.stringify(errorDetails)
      );

      // Try to refresh token if auth error
      if (
        error.message?.includes("authentication") ||
        error.message?.includes("token")
      ) {
        console.log("🔄 [RECOVERY] Auth error detected, refreshing token...");
        this.cachedToken = null;
        this.lastTokenRefresh = 0;
        await this.getAuthToken();
      }

      // Continue with degraded functionality
      console.log("✅ [RECOVERY] Background task recovery complete");
    } catch (recoveryError) {
      console.error(
        "❌ [RECOVERY] Failed to handle background error:",
        recoveryError
      );
    }
  }
}

TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({data, error}: { data: any; error: any }) => {
    const taskStartTime = Date.now();
    console.log("🌙 Background task triggered:", new Date().toISOString());

    if (error) {
      console.error("❌ Background location error:", error);
      return;
    }

    if (data) {
      const {locations} = data as { locations: Location.LocationObject[] };
      if (locations && locations[0]) {
        console.log("📍 Processing location:", {
          lat: locations[0].coords.latitude.toFixed(6),
          lng: locations[0].coords.longitude.toFixed(6),
          accuracy: locations[0].coords.accuracy,
        });

        try {
          await BackgroundTaskService.handleBackgroundLocation(locations[0]);

          const processingTime = Date.now() - taskStartTime;
          console.log(`⏱️ Background task completed in ${processingTime}ms`);

          // Performance monitoring
          if (processingTime > 5000) {
            console.warn(`⚠️ Slow background task: ${processingTime}ms`);
          }
        } catch (taskError: any) {
          const processingTime = Date.now() - taskStartTime;
          console.error(
            `❌ Background task failed after ${processingTime}ms:`,
            taskError
          );

          // Don't let background task errors crash the app-old
          try {
            await AsyncStorage.setItem(
              "lastBackgroundTaskError",
              JSON.stringify({
                error: taskError?.message || "Unknown error",
                stack: taskError?.stack || "No stack trace",
                timestamp: Date.now(),
                location: {
                  lat: locations[0].coords.latitude,
                  lng: locations[0].coords.longitude,
                },
              })
            );
          } catch (storageError) {
            console.error("❌ Failed to store error info:", storageError);
          }
        }
      }
    }
  }
);
