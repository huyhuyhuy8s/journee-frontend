import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/src/components/Map/utils/constants";
import type { LocationData, UIUpdateData } from "@/src/components/Map/utils/types";

export class StorageService {
  static async storeLocationData(locationData: LocationData): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem("locationHistory");
      const history = existingData ? JSON.parse(existingData) : [];

      history.push({
        ...locationData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      });

      if (history.length > 1000) {
        history.splice(0, history.length - 1000);
      }

      await AsyncStorage.setItem("locationHistory", JSON.stringify(history));
      console.log("💾 Location stored");
    } catch (error) {
      console.error("❌ Error storing location:", error);
    }
  }

  static async updateUIData(data: UIUpdateData): Promise<void> {
    try {
      await AsyncStorage.setItem("uiUpdateData", JSON.stringify(data));
    } catch (error) {
      console.error("❌ Error updating UI data:", error);
    }
  }

  static async getUIData(): Promise<UIUpdateData | null> {
    try {
      const data = await AsyncStorage.getItem("uiUpdateData");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("❌ Error getting UI data:", error);
      return null;
    }
  }

  static async getStorageValue(
    key: keyof typeof STORAGE_KEYS
  ): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`❌ Error getting ${key}:`, error);
      return null;
    }
  }

  static async setStorageValue(
    key: keyof typeof STORAGE_KEYS,
    value: string
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS[key], value);
    } catch (error) {
      console.error(`❌ Error setting ${key}:`, error);
    }
  }

  static async clearTrackingData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.MOVEMENT_STATE),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_SPEED),
        AsyncStorage.removeItem(STORAGE_KEYS.STATE_CHANGE_TIME),
        AsyncStorage.removeItem(STORAGE_KEYS.STATE_STABILITY_BUFFER),
        AsyncStorage.removeItem("currentTrackingConfig"),
      ]);
    } catch (error) {
      console.error("❌ Error clearing tracking data:", error);
    }
  }
}
