import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

interface LocationUpdatePayload {
  latitude: number;
  longitude: number;
  enhancedPlace?: string;
  enhancedAddress?: string;
  geocodingSource?: string;
  geocodingConfidence?: string;
  timestamp: number;
  accuracy?: number;
  speed?: number | null;
  movementState?: string;
}

interface VisitPayload {
  id: string;
  place: string;
  address: string;
  latitude: number;
  longitude: number;
  arrivalTime: number;
  departureTime?: number;
  duration?: number;
  confidence: string;
  source: string;
  visitType: string;
  metadata: {
    maxSpeed: number;
    minSpeed: number;
    averageSpeed: number;
    stationaryDuration: number;
  };
}

interface JournalEntry {
  content: string;
  latitude?: number;
  longitude?: number;
  placeName?: string;
  address?: string;
  timestamp: number;
  type: "location" | "visit" | "movement" | "note";
  metadata?: any;
}

export class BackendApiServices {
  private static readonly BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "https://journee-1gt3.onrender.com";
  private static readonly HEALTH_CHECK_TIMEOUT = 10000; // 10 seconds

  private static readonly AUTH_TOKEN_KEY = "backend_auth_token";
  private static readonly USER_ID_KEY = "backend_user_id";
  private static readonly PENDING_REQUESTS_KEY = "pending_backend_requests";

  /**
   * Store authentication token
   */
  static async setAuthToken(token: string): Promise<void> {
    try {
      // Store token in multiple locations for reliability
      await Promise.all([
        AsyncStorage.setItem("authToken", token),
        AsyncStorage.setItem("backgroundAuthToken", token),
        AsyncStorage.setItem("userToken", token),
        SecureStore.setItemAsync(this.AUTH_TOKEN_KEY, token),
      ]);
      console.log("✅ [BACKEND_API] Auth token stored successfully");
    } catch (error) {
      console.error("❌ [BACKEND_API] Error storing auth token:", error);
      throw error;
    }
  }

  /**
   * Get authentication token from secure storage
   */
  private static async getAuthToken(): Promise<string | null> {
    try {
      // Try multiple keys in order of priority
      const tokenKeys = [
        "authToken", // Main app-old token
        "backgroundAuthToken", // Background service token
        "userToken",
        "@journee/authToken",
      ];

      for (const key of tokenKeys) {
        try {
          const token = await AsyncStorage.getItem(key);
          if (token && token.length > 20) {
            console.log(`🔑 [BACKEND_API] Token found in: ${key}`);
            return token;
          }
        } catch (error) {
          console.warn(`⚠️ [BACKEND_API] Failed to read ${key}:`, error);
        }
      }

      // Fallback to SecureStore
      try {
        const token = await SecureStore.getItemAsync(this.AUTH_TOKEN_KEY);
        if (token && token.length > 20) {
          console.log(`🔑 [BACKEND_API] Token found in SecureStore`);
          return token;
        }
      } catch (error) {
        console.warn(
          `⚠️ [BACKEND_API] Failed to read from SecureStore:`,
          error
        );
      }

      console.error("❌ [BACKEND_API] No authentication token found");
      return null;
    } catch (error) {
      console.error("❌ [BACKEND_API] Error getting auth token:", error);
      return null;
    }
  }

  /**
   * Get user ID from storage
   */
  private static async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.USER_ID_KEY);
    } catch (error) {
      console.error("❌ Error getting user ID:", error);
      return null;
    }
  }

  /**
   * Store user ID
   */
  static async setUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_ID_KEY, userId);
    } catch (error) {
      console.error("❌ Error storing user ID:", error);
    }
  }

  /**
   * Make authenticated API request
   */
  private static async makeAuthenticatedRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any
  ): Promise<Response | null> {
    try {
      const token = await this.getAuthToken();

      if (!token) {
        const error = new Error("❌ No authentication token available");
        console.error(error.message);
        throw error;
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      };

      console.log(`🌐 [BACKEND_API] Making ${method} request to: ${endpoint}`);

      const response = await fetch(`${this.BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        console.error(
          `❌ [BACKEND_API] Request failed: ${response.status} ${response.statusText}`
        );

        // Handle authentication errors
        if (response.status === 401) {
          console.error(
            "🔐 [BACKEND_API] Authentication failed - token may be expired"
          );
          // Clear invalid token
          await AsyncStorage.multiRemove([
            "authToken",
            "backgroundAuthToken",
            "userToken",
            "@journee/authToken",
          ]);
        }

        return response;
      }

      console.log(`✅ [BACKEND_API] ${method} request successful: ${endpoint}`);
      return response;
    } catch (error) {
      console.error(
        `❌ [BACKEND_API] Error making request to ${endpoint}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Send location update to backend
   */
  static async sendLocationUpdate(locationData: any): Promise<boolean> {
    try {
      const payload = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: new Date(locationData.timestamp).toISOString(),
        accuracy: locationData.accuracy || null,
        speed: locationData.speed || null,
        movementState: locationData.movementState || "UNKNOWN",
        enhancedPlace: locationData.enhancedPlace || null,
        enhancedAddress: locationData.enhancedAddress || null,
        geocodingSource: locationData.geocodingSource || null,
        geocodingConfidence: locationData.geocodingConfidence || null,
        metadata: {
          source: "mobile_app",
          version: "1.0.0",
        },
      };

      const response = await this.makeAuthenticatedRequest(
        "/api/locations",
        "POST",
        payload
      );

      if (response && response.ok) {
        const result = await response.json();
        console.log(
          "✅ [BACKEND_API] Location update sent successfully:",
          result
        );
        return true;
      } else {
        await this.storePendingRequest("location", payload);
        return false;
      }
    } catch (error) {
      console.error("❌ [BACKEND_API] Error sending location update:", error);
      await this.storePendingRequest("location", locationData);
      return false;
    }
  }

  /**
   * Send visit data to backend
   */
  static async sendVisit(visitData: any): Promise<boolean> {
    try {
      const payload = {
        externalId: visitData.id,
        placeName: visitData.place,
        address: visitData.address,
        latitude: visitData.latitude,
        longitude: visitData.longitude,
        arrivalTime: new Date(visitData.arrivalTime).toISOString(),
        departureTime: visitData.departureTime
          ? new Date(visitData.departureTime).toISOString()
          : null,
        duration: visitData.duration || null,
        visitType: visitData.visitType,
        confidence: visitData.confidence,
        geocodingSource: visitData.source,
        metadata: {
          ...visitData.metadata,
          source: "mobile_app",
          version: "1.0.0",
        },
      };

      console.log("📤 [BACKEND_API] Sending visit data...");

      const response = await this.makeAuthenticatedRequest(
        "/api/visits",
        "POST",
        payload
      );

      if (response && response.ok) {
        const result = await response.json();
        console.log("✅ [BACKEND_API] Visit sent successfully:", result);
        return true;
      } else {
        console.log("❌ [BACKEND_API] Visit sending failed, will be queued");
        await this.storePendingRequest("visit", payload);
        return false;
      }
    } catch (error: any) {
      console.error("❌ [BACKEND_API] Error sending visit:", error);

      // Only throw auth errors, queue others
      if (
        error.message?.includes("authentication") ||
        error.message?.includes("token")
      ) {
        throw error;
      }

      await this.storePendingRequest("visit", visitData);
      return false;
    }
  }

  /**
   * Create journal entry for a visit
   */
  private static async createJournalEntryForVisit(
    visitData: VisitPayload
  ): Promise<void> {
    try {
      const duration = visitData.duration
        ? Math.round(visitData.duration / 1000 / 60)
        : 0;
      const content = `Visited ${visitData.place}${
        duration > 0 ? ` for ${duration} minutes` : ""
      }. ${visitData.address}`;

      const journalEntry: JournalEntry = {
        content,
        latitude: visitData.latitude,
        longitude: visitData.longitude,
        placeName: visitData.place,
        address: visitData.address,
        timestamp: visitData.arrivalTime,
        type: "visit",
        metadata: {
          visitId: visitData.id,
          visitType: visitData.visitType,
          duration,
          confidence: visitData.confidence,
          source: visitData.source,
        },
      };

      await this.createJournalEntry(journalEntry);
    } catch (error) {
      console.error("❌ Error creating journal entry for visit:", error);
    }
  }

  /**
   * Create journal entry
   */
  static async createJournalEntry(entryData: JournalEntry): Promise<boolean> {
    try {
      // First, get or create today's journal
      const today = new Date().toISOString().split("T")[0];
      const journalId = await this.getOrCreateTodaysJournal(today);

      if (!journalId) {
        console.error("❌ Failed to get or create today's journal");
        return false;
      }

      const payload = {
        journalId,
        content: entryData.content,
        timestamp: new Date(entryData.timestamp).toISOString(),
        type: entryData.type,
        location:
          entryData.latitude && entryData.longitude
            ? {
                latitude: entryData.latitude,
                longitude: entryData.longitude,
                placeName: entryData.placeName || null,
                address: entryData.address || null,
              }
            : null,
        metadata: entryData.metadata || {},
      };

      const response = await this.makeAuthenticatedRequest(
        "/journal-entries",
        "POST",
        payload
      );

      if (response && response.ok) {
        const result = await response.json();
        console.log("✅ Journal entry created successfully:", result);
        return true;
      } else {
        // Store for retry
        await this.storePendingRequest("journal_entry", payload);
        return false;
      }
    } catch (error) {
      console.error("❌ Error creating journal entry:", error);
      // Store for retry
      await this.storePendingRequest("journal_entry", entryData);
      return false;
    }
  }

  /**
   * Get or create today's journal
   */
  private static async getOrCreateTodaysJournal(
    date: string
  ): Promise<string | null> {
    try {
      // First, try to get existing journal for today
      const response = await this.makeAuthenticatedRequest(
        `/journals?date=${date}`,
        "GET"
      );

      if (response && response.ok) {
        const result = await response.json();
        if (result.journals && result.journals.length > 0) {
          console.log(
            "✅ Found existing journal for today:",
            result.journals[0].id
          );
          return result.journals[0].id;
        }
      }

      // No journal exists, create one
      console.log("📝 Creating new journal for today:", date);
      const createResponse = await this.makeAuthenticatedRequest(
        "/journals",
        "POST",
        {
          name: `Daily ${date}`,
          description: `Daily journal for ${date}`,
          date: date,
        }
      );

      if (createResponse && createResponse.ok) {
        const result = await createResponse.json();
        console.log("✅ Created new journal:", result.journal.id);
        return result.journal.id;
      } else {
        console.error("❌ Failed to create journal");
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting/creating journal:", error);
      return null;
    }
  }

  /**
   * Store pending request for retry
   */
  private static async storePendingRequest(
    type: string,
    data: any
  ): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(
        this.PENDING_REQUESTS_KEY
      );
      const pendingRequests = existingData ? JSON.parse(existingData) : [];

      pendingRequests.push({
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      });

      // Keep only last 50 pending requests
      if (pendingRequests.length > 50) {
        pendingRequests.splice(0, pendingRequests.length - 50);
      }

      await AsyncStorage.setItem(
        this.PENDING_REQUESTS_KEY,
        JSON.stringify(pendingRequests)
      );
      console.log(`💾 [BACKEND_API] Stored pending ${type} request for retry`);
    } catch (error) {
      console.error("❌ [BACKEND_API] Error storing pending request:", error);
    }
  }

  /**
   * Retry pending requests
   */
  static async retryPendingRequests(): Promise<void> {
    try {
      // Check if we have a token first
      const token = await this.getAuthToken();
      if (!token) {
        console.log("⚠️ [BACKEND_API] No token available for retry, skipping");
        return;
      }

      const existingData = await AsyncStorage.getItem(
        this.PENDING_REQUESTS_KEY
      );
      if (!existingData) return;

      const pendingRequests = JSON.parse(existingData);
      if (!pendingRequests.length) return;

      console.log(
        `🔄 [BACKEND_API] Retrying ${pendingRequests.length} pending requests`
      );

      const successfulRequests: string[] = [];
      const maxRetries = 5;

      for (const request of pendingRequests) {
        if (request.retryCount >= maxRetries) {
          console.log(
            `⏭️ [BACKEND_API] Skipping request ${request.id} - max retries reached`
          );
          successfulRequests.push(request.id);
          continue;
        }

        let success = false;

        try {
          switch (request.type) {
            case "location":
              success = await this.sendLocationUpdate(request.data);
              break;
            case "visit":
              success = await this.sendVisit(request.data);
              break;
          }

          if (success) {
            successfulRequests.push(request.id);
            console.log(
              `✅ [BACKEND_API] Successfully retried ${request.type} request`
            );
          } else {
            request.retryCount++;
            console.log(
              `❌ [BACKEND_API] Retry failed for ${request.type} request (attempt ${request.retryCount})`
            );
          }
        } catch (error: any) {
          request.retryCount++;
          console.error(
            `❌ [BACKEND_API] Error retrying ${request.type} request:`,
            error
          );

          // Remove on auth errors
          if (error.message?.includes("authentication")) {
            successfulRequests.push(request.id);
          }
        }
      }

      // Remove successful requests
      const remainingRequests = pendingRequests.filter(
        (req: any) => !successfulRequests.includes(req.id)
      );

      await AsyncStorage.setItem(
        this.PENDING_REQUESTS_KEY,
        JSON.stringify(remainingRequests)
      );

      if (successfulRequests.length > 0) {
        console.log(
          `✅ [BACKEND_API] Successfully processed ${successfulRequests.length} pending requests`
        );
      }
    } catch (error) {
      console.error("❌ [BACKEND_API] Error retrying pending requests:", error);
    }
  }

  /**
   * Get pending requests count
   */
  static async getPendingRequestsCount(): Promise<number> {
    try {
      const existingData = await AsyncStorage.getItem(
        this.PENDING_REQUESTS_KEY
      );
      if (!existingData) return 0;

      const pendingRequests = JSON.parse(existingData);
      return pendingRequests.length;
    } catch (error) {
      console.error("❌ Error getting pending requests count:", error);
      return 0;
    }
  }

  /**
   * Clear all pending requests
   */
  static async clearPendingRequests(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PENDING_REQUESTS_KEY);
      console.log("🗑️ Cleared all pending requests");
    } catch (error) {
      console.error("❌ Error clearing pending requests:", error);
    }
  }

  /**
   * Test backend connection
   */
  static async testConnection(): Promise<boolean> {
    const healthEndpoints = [
      "/api/health",
      "/health",
      "/api/status",
      "/ping",
      "/api/users/validate-token", // Since this works, use as fallback
      "/", // Root endpoint
    ];

    for (const endpoint of healthEndpoints) {
      try {
        console.log(
          `🔍 [BACKEND] Testing endpoint: ${this.BASE_URL}${endpoint}`
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.HEALTH_CHECK_TIMEOUT
        );

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };

        // Add auth token for protected endpoints
        if (endpoint.includes("/api/users/validate-token")) {
          const token = await AsyncStorage.getItem("authToken");
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
        }

        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`🔍 [BACKEND] ${endpoint} response: ${response.status}`);

        if (response.ok) {
          console.log(`✅ [BACKEND] Connected via: ${endpoint}`);
          return true;
        } else if (response.status === 404) {
          console.log(`⚠️ [BACKEND] ${endpoint} not found, trying next...`);
          continue; // Try next endpoint
        } else {
          console.log(`⚠️ [BACKEND] ${endpoint} returned: ${response.status}`);
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.error(`❌ [BACKEND] ${endpoint} timeout`);
        } else {
          console.error(`❌ [BACKEND] ${endpoint} error:`, error.message);
        }
        continue; // Try next endpoint
      }
    }

    console.error(`❌ [BACKEND] All health check endpoints failed`);
    return false;
  }

  static async testConnectionSimple(): Promise<boolean> {
    try {
      console.log(`🌐 [BACKEND] Testing with working endpoint...`);

      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("⚠️ [BACKEND] No token available for health check");
        return false;
      }

      const response = await fetch(
        `${this.BASE_URL}/api/users/validate-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const isConnected = response.ok;
      console.log(
        `🔍 [BACKEND] Simple health check: ${
          isConnected ? "SUCCESS" : "FAILED"
        } (${response.status})`
      );
      return isConnected;
    } catch (error) {
      console.error("❌ [BACKEND] Simple health check error:", error);
      return false;
    }
  }

  static async testConnectionDetailed(): Promise<{
    isConnected: boolean;
    endpoint: string | null;
    error?: string;
  }> {
    const endpoints = ["/api/health", "/health", "/api/status", "/ping"];

    for (const endpoint of endpoints) {
      try {
        console.log(
          `🔍 [BACKEND] Testing endpoint: ${this.BASE_URL}${endpoint}`
        );

        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log(`✅ [BACKEND] Connected via: ${endpoint}`);
          return {
            isConnected: true,
            endpoint: endpoint,
          };
        }
      } catch (error) {
        console.log(
          `❌ [BACKEND] Failed ${endpoint}:`,
          (error as Error).message
        );
        continue;
      }
    }

    return {
      isConnected: false,
      endpoint: null,
      error: "All health check endpoints failed",
    };
  }

  /**
   * Authenticate user and get token
   */
  static async authenticate(userId: string, token: string): Promise<boolean> {
    try {
      console.log("🔐 [BACKEND_API] Authenticating user:", userId);

      // Store credentials
      await this.setAuthToken(token);
      await this.setUserId(userId);

      // Test the token by making an authenticated request
      const response = await this.makeAuthenticatedRequest(
        "/auth/verify",
        "GET"
      );

      if (response && response.ok) {
        console.log("✅ [BACKEND_API] Authentication successful");
        return true;
      } else {
        console.error("❌ [BACKEND_API] Authentication failed - invalid token");
        return false;
      }
    } catch (error) {
      console.error("❌ [BACKEND_API] Authentication error:", error);
      return false;
    }
  }

  /**
   * Clear authentication data
   */
  static async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(this.AUTH_TOKEN_KEY),
        AsyncStorage.multiRemove([
          this.USER_ID_KEY,
          "authToken",
          "backgroundAuthToken",
          "userToken",
          "@journee/authToken",
        ]),
      ]);
      console.log("🔓 [BACKEND_API] Authentication cleared");
    } catch (error) {
      console.error("❌ [BACKEND_API] Error clearing auth:", error);
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("ℹ️ [BACKEND] No auth token found");
        return false;
      }

      const response = await fetch(
        `${this.BASE_URL}/api/users/validate-token`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const isAuth = response.ok;
      console.log(
        `🔐 [BACKEND] Authentication check: ${isAuth ? "PASSED" : "FAILED"}`
      );
      return isAuth;
    } catch (error) {
      console.error("❌ [BACKEND] Auth check error:", error);
      return false;
    }
  }
}
