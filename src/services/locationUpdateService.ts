import {IRegion} from '@/types';

type LocationUpdateCallback = (location: IRegion) => void;

/**
 * Singleton service for broadcasting location updates to subscribers.
 * This replaces polling AsyncStorage by providing an event-driven approach
 * where components can subscribe to location changes and receive immediate updates.
 */
class LocationUpdateService {
  private static instance: LocationUpdateService;
  private listeners: Set<LocationUpdateCallback> = new Set();

  private constructor() {}

  static getInstance(): LocationUpdateService {
    if (!LocationUpdateService.instance) {
      LocationUpdateService.instance = new LocationUpdateService();
    }
    return LocationUpdateService.instance;
  }

  /**
   * Notify all subscribers of a location update
   * @param location - The updated location region with coordinates and optional timestamp
   */
  notifyLocationUpdate(location: IRegion): void {
    this.listeners.forEach(listener => {
      try {
        listener(location);
      } catch (error) {
        console.error('Error in location update listener:', error);
      }
    });
  }

  /**
   * Subscribe to location updates
   * @param callback - Function to call when location updates occur
   * @returns Unsubscribe function to remove the listener
   */
  onLocationUpdate(callback: LocationUpdateCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export default LocationUpdateService.getInstance();
