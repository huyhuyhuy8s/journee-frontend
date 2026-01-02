import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userLocationStateService from '@/services/userLocationStateService';
import journalService from '@/services/journalService';
import {ASYNC_STORAGE_KEYS, EUserLocationState, STATE_INTERVALS} from '@/constants';
import {isSameLocation} from '@/utils/location';

export const BACKGROUND_LOCATION_TASK = 'background-location-task';
export const FOREGROUND_LOCATION_TASK = 'foreground-location-task';

const {FAST_MOVING, SLOW_MOVING, STATIONARY} = EUserLocationState;
const {
  LOCATION_STATE_CHANGED,
  CURRENT_LOCATION,
  LAST_BACKGROUND_PROCESS,
  LAST_FOREGROUND_PROCESS,
} = ASYNC_STORAGE_KEYS;

interface TLocationTaskData {
  locations: Location.LocationObject[];
}

const handleFastMovingVisit = async (
  location: Location.LocationObject,
): Promise<void> => {
  try {
    const pendingVisit = await journalService.getPendingVisit();

    if (!pendingVisit) {
      await journalService.startPendingVisit(location);
      return;
    }

    if (
      isSameLocation(
        pendingVisit.location.coords.latitude,
        pendingVisit.location.coords.longitude,
        location.coords.latitude,
        location.coords.longitude,
      )
    ) {
      await journalService.updatePendingVisit(location);

      const duration = Date.now() - pendingVisit.startTime;
      if (duration >= 60000) {
        await journalService.completePendingVisit();
      }
    } else {
      await journalService.cancelPendingVisit();
      await journalService.startPendingVisit(location);
    }
  } catch (error) {
    console.error('❌ Error handling fast moving visit:', error);
  }
};

const syncForegroundLocationToBackend = async (
  location: Location.LocationObject,
): Promise<void> => {
  try {
    const lastSyncStr = await AsyncStorage.getItem(LAST_FOREGROUND_PROCESS);
    const lastSync = lastSyncStr ? parseInt(lastSyncStr) : 0;
    const now = Date.now();

    if (now - lastSync < 10000) {
      return;
    }

    const results = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (results && results.length > 0) {
      // const address = results[0];
      //
      // await journalApiService.updateLocation(
      //   {
      //     latitude: location.coords.latitude,
      //     longitude: location.coords.longitude,
      //   },
      //   address.name || undefined,
      //   address.street || undefined,
      //   address.city || undefined,
      //   address.region || undefined,
      //   address.country || undefined,
      //   [
      //     address.name,
      //     address.street,
      //     address.city,
      //     address.region,
      //     address.country,
      //   ]
      //     .filter(Boolean)
      //     .join(', '),
      // );

      await AsyncStorage.setItem(LAST_FOREGROUND_PROCESS, now.toString());
      console.info('🔄 Synced foreground location to backend');
    }
  } catch (error) {
    console.warn('⚠️ Failed to sync foreground location to backend:', error);
  }
};

TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({
    data,
    error,
  }: TaskManager.TaskManagerTaskBody<TLocationTaskData>) => {
    if (error) {
      console.error('❌ Background location error:', error);
      return;
    }

    if (data) {
      const {locations} = data;
      const location = locations[0];

      if (!location) return;

      try {
        const currentState = await userLocationStateService.getCurrentState();
        const requiredInterval = STATE_INTERVALS[currentState];

        const lastProcessTimeStr = await AsyncStorage.getItem(
          LAST_BACKGROUND_PROCESS,
        );
        const lastProcessTime = lastProcessTimeStr
          ? parseInt(lastProcessTimeStr)
          : 0;
        const now = Date.now();
        const timeSinceLastProcess = now - lastProcessTime;

        if (timeSinceLastProcess < requiredInterval) {
          console.info(
            `⏱️ Skipping update - only ${Math.round(timeSinceLastProcess / 1000)}s passed, need ${Math.round(requiredInterval / 1000)}s`,
          );
          return;
        }

        console.info('📍 Background location update:', {
          lat: location.coords.latitude.toFixed(6),
          lng: location.coords.longitude.toFixed(6),
          speed: location.coords.speed,
          timeSinceLastProcess: `${Math.round(timeSinceLastProcess / 1000)}s`,
        });

        await AsyncStorage.setItem(LAST_BACKGROUND_PROCESS, now.toString());

        const stateResult =
          await userLocationStateService.determineState(location);
        const newState = stateResult.newState;

        console.info(
          `🏃 Current state: ${newState} (v: ${stateResult.velocity?.toFixed(2)} km/h)`,
        );

        switch (newState) {
          case FAST_MOVING:
            await handleFastMovingVisit(location);
            break;

          case SLOW_MOVING:
          case STATIONARY:
            await journalService.addOrUpdateEntry(location);
            break;
        }

        if (stateResult.shouldUpdateInterval) {
          await AsyncStorage.setItem(LOCATION_STATE_CHANGED, 'true');
        }
      } catch (error) {
        console.error('❌ Error processing background location:', error);
      }
    }
  },
);

TaskManager.defineTask(
  FOREGROUND_LOCATION_TASK,
  async ({
    data,
    error,
  }: TaskManager.TaskManagerTaskBody<TLocationTaskData>) => {
    if (error) {
      console.error('❌ Foreground location error:', error);
      return;
    }

    if (data) {
      const {locations} = data;
      const location = locations[0];

      if (!location) return;

      console.info('📍 Foreground location update:', {
        lat: location.coords.latitude.toFixed(6),
        lng: location.coords.longitude.toFixed(6),
        speed: location.coords.speed,
      });

      try {
        await AsyncStorage.setItem(
          CURRENT_LOCATION,
          JSON.stringify({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
            timestamp: location.timestamp,
          }),
        );

        await userLocationStateService.addLocationToHistory(location);

        await syncForegroundLocationToBackend(location);
      } catch (error) {
        console.error('❌ Error processing foreground location:', error);
      }
    }
  },
);
