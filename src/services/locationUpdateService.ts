import {IRegion} from '@/types';

type LocationUpdateCallback = (location: IRegion) => void;

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

  notifyLocationUpdate(location: IRegion): void {
    this.listeners.forEach(listener => {
      try {
        listener(location);
      } catch (error) {
        console.error('❌ Error in location update listener:', error);
      }
    });
  }

  onLocationUpdate(callback: LocationUpdateCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export default LocationUpdateService.getInstance();
