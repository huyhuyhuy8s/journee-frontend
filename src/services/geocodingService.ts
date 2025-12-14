// services/geocodingService.ts
import * as Location from "expo-location";

interface OpenMapsResponse {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    types: string[];
    name?: string;
  }>;
  status: string;
}

interface ExpoGeocodingResult {
  place: string;
  value: string;
  source: "expo";
}

interface OpenMapsGeocodingResult {
  place: string;
  value: string;
  source: "openmaps";
  types: string[];
}

interface BestGeocodingResult {
  place: string;
  value: string;
  source: "expo" | "openmaps" | "combined";
  confidence: "high" | "medium" | "low";
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

interface CacheEntry {
  result: BestGeocodingResult;
  timestamp: number;
}

export class GlobalGeocodingService {
  private static readonly OPEN_MAPS_API_KEY =
    process.env.EXPO_PUBLIC_OPEN_MAPS_API_KEY;
  private static readonly OPEN_MAPS_BASE_URL = "https://mapapis.openmap.vn/v1";

  // Cache configuration
  private static readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  private static readonly CACHE_DISTANCE_THRESHOLD = 50; // meters
  private static readonly MAX_CACHE_SIZE = 100;

  // Cache storage
  private static cache = new Map<string, CacheEntry>();

  // Pending requests to prevent duplicate API calls
  private static pendingRequests = new Map<
    string,
    Promise<BestGeocodingResult | null>
  >();

  // Priority order for location types (higher index = higher priority)
  private static readonly LOCATION_TYPE_PRIORITIES = [
    // Basic location types
    "political",
    "locality",
    "sublocality",
    "neighborhood",

    // Transportation
    "transit_station",
    "subway_station",
    "bus_station",
    "train_station",

    // Commercial places
    "store",
    "convenience_store",
    "gas_station",
    "restaurant",
    "cafe",
    "bank",
    "atm",
    "hospital",
    "pharmacy",
    "school",
    "university",

    // Attractions and landmarks
    "tourist_attraction",
    "museum",
    "park",
    "shopping_mall",
    "establishment",
    "point_of_interest",
  ];

  /**
   * Generate cache key for coordinates (rounded to reduce cache misses for nearby locations)
   */
  private static generateCacheKey(latitude: number, longitude: number): string {
    // Round to 4 decimal places (~11m precision) for cache efficiency
    const roundedLat = Math.round(latitude * 10000) / 10000;
    const roundedLng = Math.round(longitude * 10000) / 10000;
    return `${roundedLat},${roundedLng}`;
  }

  /**
   * Generate request key for deduplication (more precise)
   */
  private static generateRequestKey(
    latitude: number,
    longitude: number
  ): string {
    // Use full precision for request deduplication
    return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  }

  /**
   * Check if cached result is still valid and close enough
   */
  private static getCachedResult(
    latitude: number,
    longitude: number
  ): BestGeocodingResult | null {
    try {
      const now = Date.now();

      // Clean expired entries first
      this.cleanExpiredCache(now);

      // Check for exact match first
      const exactKey = this.generateCacheKey(latitude, longitude);
      const exactEntry = this.cache.get(exactKey);

      if (exactEntry && now - exactEntry.timestamp < this.CACHE_DURATION_MS) {
        console.log(`🎯 Cache HIT (exact): ${exactKey}`);
        return exactEntry.result;
      }

      // Check for nearby cached results (within threshold)
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp < this.CACHE_DURATION_MS) {
          const [cachedLat, cachedLng] = key.split(",").map(Number);
          const distance = this.calculateDistance(
            latitude,
            longitude,
            cachedLat,
            cachedLng
          );

          if (distance <= this.CACHE_DISTANCE_THRESHOLD) {
            console.log(
              `🎯 Cache HIT (nearby): ${key} (${distance.toFixed(0)}m away)`
            );
            return entry.result;
          }
        }
      }

      console.log(`❌ Cache MISS: ${exactKey}`);
      return null;
    } catch (error) {
      console.error("❌ Error checking cache:", error);
      return null;
    }
  }

  /**
   * Store result in cache
   */
  private static setCachedResult(
    latitude: number,
    longitude: number,
    result: BestGeocodingResult
  ): void {
    try {
      const key = this.generateCacheKey(latitude, longitude);
      const entry: CacheEntry = {
        result,
        timestamp: Date.now(),
      };

      this.cache.set(key, entry);

      // Limit cache size
      if (this.cache.size > this.MAX_CACHE_SIZE) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) {
          this.cache.delete(oldestKey);
          console.log(`🗑️ Cache cleanup: removed ${oldestKey}`);
        }
      }

      console.log(`💾 Cached result: ${key} (cache size: ${this.cache.size})`);
    } catch (error) {
      console.error("❌ Error setting cache:", error);
    }
  }

  /**
   * Clean expired cache entries
   */
  private static cleanExpiredCache(now: number): void {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.CACHE_DURATION_MS) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`🗑️ Cleaned ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Calculate distance between two coordinates in meters
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
   * Compare and get the best result from both APIs (main entry point)
   */
  static async getBestGeocodingResult(
    latitude: number,
    longitude: number
  ): Promise<BestGeocodingResult | null> {
    try {
      // Check cache first
      const cachedResult = this.getCachedResult(latitude, longitude);
      if (cachedResult) {
        return cachedResult;
      }

      // Check if there's already a pending request for this location
      const requestKey = this.generateRequestKey(latitude, longitude);

      if (this.pendingRequests.has(requestKey)) {
        console.log(`⏳ Request already pending for: ${requestKey}`);
        return await this.pendingRequests.get(requestKey)!;
      }

      // Create new request
      const requestPromise = this.performGeocodingRequest(latitude, longitude);
      this.pendingRequests.set(requestKey, requestPromise);

      try {
        const result = await requestPromise;

        // Cache the result if successful
        if (result) {
          this.setCachedResult(latitude, longitude, result);
        }

        return result;
      } finally {
        // Clean up pending request
        this.pendingRequests.delete(requestKey);
      }
    } catch (error) {
      console.error("❌ Error in getBestGeocodingResult:", error);
      return null;
    }
  }

  /**
   * Perform the actual geocoding request (internal method)
   */
  private static async performGeocodingRequest(
    latitude: number,
    longitude: number
  ): Promise<BestGeocodingResult | null> {
    console.log(
      `🔍 Starting geocoding request for: ${latitude.toFixed(
        6
      )}, ${longitude.toFixed(6)}`
    );

    // Run both APIs concurrently
    const [openMapsResult, expoResult] = await Promise.allSettled([
      this.reverseGeocodeOpenMaps(latitude, longitude),
      this.reverseGeocodeExpo(latitude, longitude),
    ]);

    const openMapsData =
      openMapsResult.status === "fulfilled" ? openMapsResult.value : null;
    const expoData =
      expoResult.status === "fulfilled" ? expoResult.value : null;

    // Determine the best result
    const bestResult = this.compareMapsResults(openMapsData, expoData);

    console.log("🎯 Best result selected:", bestResult);

    return bestResult;
  }

  /**
   * Reverse geocode using OpenMaps API
   */
  static async reverseGeocodeOpenMaps(
    latitude: number,
    longitude: number
  ): Promise<OpenMapsGeocodingResult | null> {
    try {
      if (!this.OPEN_MAPS_API_KEY) {
        console.warn("⚠️ OpenMaps API key not found in environment variables");
        return null;
      }

      const url = `${this.OPEN_MAPS_BASE_URL}/geocode/reverse?latlng=${latitude},${longitude}&apiKey=${this.OPEN_MAPS_API_KEY}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `❌ OpenMaps API error: ${response.status} ${response.statusText}`
        );
        return null;
      }

      const data: OpenMapsResponse = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        console.warn("⚠️ OpenMaps returned no results");
        return null;
      }

      // Find the best result based on types priority
      const bestResult = this.findBestOpenMapsResult(data.results);

      if (!bestResult) {
        return null;
      }

      const placeName = this.extractPlaceName(bestResult);
      const formattedAddress =
        bestResult.formatted_address || "Unknown Address";

      return {
        place: placeName,
        value: formattedAddress,
        source: "openmaps",
        types: bestResult.types || [],
      };
    } catch (error) {
      console.error("❌ Error with OpenMaps reverse geocoding:", error);
      return null;
    }
  }

  /**
   * Reverse geocode using Expo Location API
   */
  static async reverseGeocodeExpo(
    latitude: number,
    longitude: number
  ): Promise<ExpoGeocodingResult | null> {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result[0]) {
        const location = result[0];
        const placeName =
          location.name ||
          location.street ||
          location.district ||
          location.subregion ||
          location.city ||
          "Unknown Place";

        const formattedAddress =
          location.formattedAddress ||
          `${location.street || ""} ${location.city || ""}`.trim() ||
          "Unknown Address";

        return {
          place: placeName,
          value: formattedAddress,
          source: "expo",
        };
      }

      return null;
    } catch (error) {
      console.error("❌ Error with Expo reverse geocoding:", error);
      return null;
    }
  }

  /**
   * Find the best result from OpenMaps based on location type priorities
   */
  private static findBestOpenMapsResult(results: OpenMapsResponse["results"]) {
    let bestResult = null;
    let highestPriority = -1;

    for (const result of results) {
      if (!result.types || result.types.length === 0) continue;

      // Calculate priority score for this result
      const priority = this.calculateLocationPriority(result.types);

      if (priority > highestPriority) {
        highestPriority = priority;
        bestResult = result;
      }
    }

    // If no high-priority result found, return the first one
    return bestResult || results[0];
  }

  /**
   * Calculate priority score based on location types
   */
  private static calculateLocationPriority(types: string[]): number {
    let maxPriority = -1;

    for (const type of types) {
      const priority = this.LOCATION_TYPE_PRIORITIES.indexOf(type);
      if (priority > maxPriority) {
        maxPriority = priority;
      }
    }

    return maxPriority;
  }

  /**
   * Extract the best place name from OpenMaps result
   */
  private static extractPlaceName(
    result: OpenMapsResponse["results"][0]
  ): string {
    // First, try to get name from the result directly
    if (result.name && result.name.trim()) {
      return result.name.trim();
    }

    // Try to extract from address components based on priority
    const priorityTypes = [
      "establishment",
      "point_of_interest",
      "store",
      "transit_station",
      "subway_station",
      "bus_station",
      "restaurant",
      "cafe",
      "convenience_store",
      "gas_station",
      "bank",
      "atm",
      "hospital",
      "pharmacy",
      "school",
      "university",
      "tourist_attraction",
      "museum",
      "park",
      "shopping_mall",
    ];

    for (const priorityType of priorityTypes) {
      const component = result.address_components?.find((comp) =>
        comp.types.includes(priorityType)
      );

      if (component && component.long_name) {
        return component.long_name;
      }
    }

    // Fallback to other address components
    const fallbackTypes = [
      "neighborhood",
      "sublocality",
      "locality",
      "administrative_area_level_2",
    ];

    for (const fallbackType of fallbackTypes) {
      const component = result.address_components?.find((comp) =>
        comp.types.includes(fallbackType)
      );

      if (component && component.long_name) {
        return component.long_name;
      }
    }

    return "Unknown Place";
  }

  /**
   * Compare results from both APIs and return the best one
   */
  private static compareMapsResults(
    openMapsResult: OpenMapsGeocodingResult | null,
    expoResult: ExpoGeocodingResult | null
  ): BestGeocodingResult | null {
    // If only one result is available
    if (!openMapsResult && !expoResult) {
      return null;
    }

    if (!openMapsResult && expoResult) {
      return {
        ...expoResult,
        confidence: "medium",
        // 🆕 Add missing fields with fallback values
        formattedAddress: expoResult.value,
        street: undefined,
        city: undefined,
        region: undefined,
        country: undefined,
        postalCode: undefined,
      };
    }

    if (openMapsResult && !expoResult) {
      return {
        ...openMapsResult,
        confidence: "medium",
        // 🆕 Add missing fields with fallback values
        formattedAddress: openMapsResult.value,
        street: undefined,
        city: undefined,
        region: undefined,
        country: undefined,
        postalCode: undefined,
      };
    }

    // Both results available - choose the best one
    if (openMapsResult && expoResult) {
      // Prefer OpenMaps if it has specific place types (POI, establishments, etc.)
      const hasHighPriorityTypes = openMapsResult.types.some((type) =>
        [
          "establishment",
          "point_of_interest",
          "store",
          "transit_station",
          "subway_station",
          "restaurant",
          "cafe",
          "convenience_store",
          "tourist_attraction",
          "museum",
          "bank",
          "hospital",
        ].includes(type)
      );

      if (hasHighPriorityTypes) {
        return {
          place: openMapsResult.place,
          value: openMapsResult.value,
          source: "openmaps",
          confidence: "high",
          // 🆕 Add missing fields
          formattedAddress: openMapsResult.value,
          street: undefined,
          city: undefined,
          region: undefined,
          country: undefined,
          postalCode: undefined,
        };
      }

      // If OpenMaps place name is more specific (longer and not generic)
      if (
        openMapsResult.place.length > expoResult.place.length &&
        !this.isGenericPlaceName(openMapsResult.place)
      ) {
        return {
          place: openMapsResult.place,
          value: expoResult.value, // Use Expo's address as it's usually more complete
          source: "combined",
          confidence: "high",
          // 🆕 Add missing fields
          formattedAddress: expoResult.value,
          street: undefined,
          city: undefined,
          region: undefined,
          country: undefined,
          postalCode: undefined,
        };
      }

      // Default to Expo result with OpenMaps place name if it's better
      if (
        !this.isGenericPlaceName(openMapsResult.place) &&
        this.isGenericPlaceName(expoResult.place)
      ) {
        return {
          place: openMapsResult.place,
          value: expoResult.value,
          source: "combined",
          confidence: "medium",
          // 🆕 Add missing fields
          formattedAddress: expoResult.value,
          street: undefined,
          city: undefined,
          region: undefined,
          country: undefined,
          postalCode: undefined,
        };
      }

      // Default to Expo result
      return {
        ...expoResult,
        confidence: "medium",
        // 🆕 Add missing fields
        formattedAddress: expoResult.value,
        street: undefined,
        city: undefined,
        region: undefined,
        country: undefined,
        postalCode: undefined,
      };
    }

    return null;
  }

  /**
   * Check if a place name is generic/not specific
   */
  private static isGenericPlaceName(placeName: string): boolean {
    const genericNames = [
      "unknown place",
      "unnamed road",
      "unnamed",
      "address",
      "location",
      "place",
      "street",
      "road",
    ];

    return genericNames.some((generic) =>
      placeName.toLowerCase().includes(generic.toLowerCase())
    );
  }

  static getFallbackResult(
    latitude: number,
    longitude: number
  ): BestGeocodingResult {
    return {
      place: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      value: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      source: "combined",
      confidence: "low",
      // 🆕 Add missing fields
      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      street: undefined,
      city: undefined,
      region: undefined,
      country: undefined,
      postalCode: undefined,
    };
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  static clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log("🗑️ Geocoding cache cleared");
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; pendingRequests: number } {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}
