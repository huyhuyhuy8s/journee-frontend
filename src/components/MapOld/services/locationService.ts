import * as Location from "expo-location";
import {GlobalGeocodingService} from "@/services/geocodingService";

export class LocationService {
  static async requestForegroundPermissions(): Promise<Location.PermissionStatus> {
    try {
      const result = await Location.requestForegroundPermissionsAsync();
      return result.status;
    } catch (error) {
      console.error("❌ Error requesting foreground permissions:", error);
      return Location.PermissionStatus.DENIED;
    }
  }

  static async requestBackgroundPermissions(): Promise<Location.PermissionStatus> {
    try {
      const result = await Location.requestBackgroundPermissionsAsync();
      return result.status;
    } catch (error) {
      console.error("❌ Error requesting background permissions:", error);
      return Location.PermissionStatus.DENIED;
    }
  }

  static async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      console.error("❌ Error getting current location:", error);
      return null;
    }
  }

  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{
    place: string;
    value: string;
    confidence?: string;
    source?: string;
    // 🆕 Add more detailed address fields if your GlobalGeocodingService supports them
    street?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    formattedAddress?: string;
  } | null> {
    try {
      // Use the global geocoding service for best results
      const result = await GlobalGeocodingService.getBestGeocodingResult(
        latitude,
        longitude
      );

      if (result) {
        return {
          place: result.place,
          value: result.value,
          confidence: result.confidence,
          source: result.source,
          formattedAddress: result.value,
          street: result.street,
          city: result.city,
          region: result.region,
          country: result.country,
          postalCode: result.postalCode,
        };
      }

      // Fallback to basic coordinates if all else fails
      const fallback = GlobalGeocodingService.getFallbackResult(
        latitude,
        longitude
      );
      return {
        place: fallback.place,
        value: fallback.value,
        confidence: fallback.confidence,
        source: fallback.source,
        formattedAddress: fallback.value,
      };
    } catch (error) {
      console.error("❌ Error with enhanced reverse geocoding:", error);

      // Last resort fallback
      return {
        place: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        value: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        confidence: "low",
        source: "fallback",
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    }
  }
}
