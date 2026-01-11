import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import userLocationStateService from './userLocationStateService';
import {FOREGROUND_INTERVAL} from '@/constants';
import {BACKGROUND_LOCATION_TASK, FOREGROUND_LOCATION_TASK} from '@/features/map/task';

class LocationTrackingService {
  private static instance: LocationTrackingService;

  private constructor() {
  }

  static getInstance = (): LocationTrackingService => {
    if (!LocationTrackingService.instance) {
      LocationTrackingService.instance = new LocationTrackingService();
    }
    return LocationTrackingService.instance;
  };

  async requestBackgroundPermission(): Promise<boolean> {
    try {
      const {status} = await Location.requestBackgroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error requesting background permission:', error);
      return false;
    }
  }

  async requestForegroundPermission(): Promise<boolean> {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error requesting foreground permission:', error);
      return false;
    }
  }

  async startBackgroundTracking(): Promise<boolean> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isRegistered) {
        console.info('ℹ️ Background task already running');
        return true;
      }

      const taskDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
      if (!taskDefined) {
        console.error('Background location task is not defined');
        return false;
      }

      const interval = await userLocationStateService.getCurrentInterval();

      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: interval,
        distanceInterval: 0,
        foregroundService: {
          notificationTitle: 'Journee is tracking your location',
          notificationBody: 'Your journey is being recorded',
          notificationColor: '#4F46E5',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      console.info('✅ Background tracking started with interval:', interval / 1000, 'seconds');
      return true;
    } catch (error) {
      console.error('❌ Error starting background tracking:', error);
      return false;
    }
  }

  async stopBackgroundTracking(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.info('ℹ️ Background tracking stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping background tracking:', error);
    }
  }

  async restartBackgroundTracking(): Promise<void> {
    console.info('🔄 Restarting background tracking...');
    await this.stopBackgroundTracking();
    await new Promise(resolve => setTimeout(resolve, 300));
    await this.startBackgroundTracking();
    console.info('✅ Background tracking restarted');
  }

  async startForegroundTracking(): Promise<boolean> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(FOREGROUND_LOCATION_TASK);
      if (isRegistered) {
        console.info('ℹ️ Foreground task already running');
        return true;
      }

      const taskDefined = TaskManager.isTaskDefined(FOREGROUND_LOCATION_TASK);
      if (!taskDefined) {
        console.error('Foreground location task is not defined');
        return false;
      }

      await Location.startLocationUpdatesAsync(FOREGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: FOREGROUND_INTERVAL.TIME,
        distanceInterval: FOREGROUND_INTERVAL.DISTANCE,
        showsBackgroundLocationIndicator: false,
      });

      console.info('✅ Foreground tracking started');
      return true;
    } catch (error) {
      console.error('❌ Error starting foreground tracking:', error);
      return false;
    }
  }

  async stopForegroundTracking(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(FOREGROUND_LOCATION_TASK);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(FOREGROUND_LOCATION_TASK);
        console.info('ℹ️ Foreground tracking stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping foreground tracking:', error);
    }
  }

  async isBackgroundTrackingActive(): Promise<boolean> {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  }

  async isForegroundTrackingActive(): Promise<boolean> {
    return await TaskManager.isTaskRegisteredAsync(FOREGROUND_LOCATION_TASK);
  }
}

export default LocationTrackingService.getInstance();
