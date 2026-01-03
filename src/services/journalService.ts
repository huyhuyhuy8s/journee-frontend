import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {Timestamp} from '@firebase/firestore';
import type {IEntry, IJournal, ILocation, IPendingVisit} from '@/types';
import {ASYNC_STORAGE_KEYS, MIN_VISIT_DURATION} from '@/constants';
import {journalApiService} from '@/services/api';
import {generateId, getTodayDateString, isSameLocation} from '@/utils/location';

interface ILocalJournal extends Omit<
  IJournal,
  'createdAt' | 'updatedAt' | 'entries'
> {
  date: string;
  entries: ILocalEntry[];
  localId: string;
  synced: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ILocalEntry extends Omit<
  IEntry,
  'createdAt' | 'updatedAt' | 'arrivalTime' | 'departureTime'
> {
  arrivalTime: number;
  departureTime?: number;
  localId: string;
  synced: boolean;
  createdAt: number;
  updatedAt: number;
}

const {CURRENT_JOURNAL, PENDING_VISIT} = ASYNC_STORAGE_KEYS;

class JournalService {
  private static instance: JournalService;
  private isSyncing = false;

  private constructor() {
  }

  static getInstance = (): JournalService => {
    if (!JournalService.instance) {
      JournalService.instance = new JournalService();
    }
    return JournalService.instance;
  };

  getTodaysJournal = async (): Promise<ILocalJournal> => {
    try {
      const journalJson = await AsyncStorage.getItem(CURRENT_JOURNAL);
      const todayDate = getTodayDateString();

      if (journalJson) {
        const journal: ILocalJournal = JSON.parse(journalJson);

        if (journal.date === todayDate) {
          return journal;
        }
      }

      const now = Date.now();
      const newJournal: ILocalJournal = {
        id: '',
        userId: '',
        name: `Journal ${todayDate}`,
        date: todayDate,
        entries: [],
        localId: generateId(),
        synced: false,
        createdAt: now,
        updatedAt: now,
      };

      await AsyncStorage.setItem(CURRENT_JOURNAL, JSON.stringify(newJournal));
      console.info('📓 Created new journal for', todayDate);

      return newJournal;
    } catch (error) {
      console.error('❌ Error getting today\'s journal:', error);
      throw error;
    }
  };

  addOrUpdateEntry = async (
    location: Location.LocationObject,
  ): Promise<void> => {
    try {
      const journal = await this.getTodaysJournal();
      const now = Date.now();

      const locationData = await this.reverseGeocode(
        location.coords.latitude,
        location.coords.longitude,
      );

      if (!locationData) {
        console.warn('⚠️ Could not geocode location, skipping entry');
        return;
      }

      if (journal.entries.length > 0) {
        const lastEntry = journal.entries[journal.entries.length - 1];

        if (
          isSameLocation(
            lastEntry.location.coordinate.latitude,
            lastEntry.location.coordinate.longitude,
            location.coords.latitude,
            location.coords.longitude,
          )
        ) {
          lastEntry.departureTime = now;
          lastEntry.synced = false;
          lastEntry.updatedAt = now;

          await AsyncStorage.setItem(CURRENT_JOURNAL, JSON.stringify(journal));
          console.info('🔄 Updated departure time for existing entry');
          return;
        } else {
          if (!lastEntry.departureTime) {
            lastEntry.departureTime = now;
            lastEntry.synced = false;
            lastEntry.updatedAt = now;
          }
        }
      }

      const newEntry: ILocalEntry = {
        id: undefined,
        journalId: journal.id || journal.localId,
        name: locationData.place || locationData.value,
        location: locationData,
        images: [],
        thought: undefined,
        arrivalTime: now,
        localId: generateId(),
        synced: false,
        createdAt: now,
        updatedAt: now,
      };

      journal.entries.push(newEntry);
      journal.updatedAt = now;

      await AsyncStorage.setItem(CURRENT_JOURNAL, JSON.stringify(journal));
      console.info(
        '✅ Created new entry at',
        locationData.value || 'unknown location',
      );
    } catch (error) {
      console.error('❌ Error adding/updating entry:', error);
    }
  };

  startPendingVisit = async (
    location: Location.LocationObject,
  ): Promise<void> => {
    try {
      const pendingVisit: IPendingVisit = {
        location,
        startTime: Date.now(),
        lastUpdateTime: Date.now(),
      };

      await AsyncStorage.setItem(PENDING_VISIT, JSON.stringify(pendingVisit));
      console.info('🚩 Started pending visit');
    } catch (error) {
      console.error('❌ Error starting pending visit:', error);
    }
  };

  updatePendingVisit = async (
    location: Location.LocationObject,
  ): Promise<void> => {
    try {
      const pendingVisitJson = await AsyncStorage.getItem(PENDING_VISIT);

      if (!pendingVisitJson) return;

      const pendingVisit: IPendingVisit = JSON.parse(pendingVisitJson);

      if (
        isSameLocation(
          pendingVisit.location.coords.latitude,
          pendingVisit.location.coords.longitude,
          location.coords.latitude,
          location.coords.longitude,
        )
      ) {
        pendingVisit.lastUpdateTime = Date.now();
        await AsyncStorage.setItem(PENDING_VISIT, JSON.stringify(pendingVisit));
      } else {
        await this.cancelPendingVisit();
      }
    } catch (error) {
      console.error('❌ Error updating pending visit:', error);
    }
  };

  completePendingVisit = async (): Promise<boolean> => {
    try {
      const pendingVisitJson = await AsyncStorage.getItem(PENDING_VISIT);

      if (!pendingVisitJson) return false;

      const pendingVisit: IPendingVisit = JSON.parse(pendingVisitJson);
      const duration = Date.now() - pendingVisit.startTime;

      if (duration >= MIN_VISIT_DURATION) {
        await this.addOrUpdateEntry(pendingVisit.location);
        await AsyncStorage.removeItem(PENDING_VISIT);
        console.info(
          '✅ Completed pending visit (stayed for',
          Math.round(duration / 1000),
          'seconds)',
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error completing pending visit:', error);
      return false;
    }
  };

  cancelPendingVisit = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(PENDING_VISIT);
      console.info('❌ Cancelled pending visit');
    } catch (error) {
      console.error('❌ Error cancelling pending visit:', error);
    }
  };

  getPendingVisit = async (): Promise<IPendingVisit | null> => {
    try {
      const pendingVisitJson = await AsyncStorage.getItem(PENDING_VISIT);
      return pendingVisitJson ? JSON.parse(pendingVisitJson) : null;
    } catch (error) {
      console.error('❌ Error getting pending visit:', error);
      return null;
    }
  };

  syncPendingEntries = async (): Promise<void> => {
    if (this.isSyncing) {
      console.info('⏳ Sync already in progress, skipping...');
      return;
    }

    try {
      this.isSyncing = true;
      const journal = await this.getTodaysJournal();
      const unsyncedEntries = journal.entries.filter((entry) => !entry.synced);

      if (unsyncedEntries.length === 0) {
        console.info('✅ No unsynced entries to sync');
        this.isSyncing = false;
        return;
      }

      console.info(`🔄 Syncing ${unsyncedEntries.length} entries to backend...`);

      if (!journal.synced && !journal.id) {
        try {
          const backendJournal = await journalApiService.createJournal(
            journal.name,
          );
          journal.id = backendJournal.id;
          journal.synced = true;
          console.info('🔄 Synced journal to backend');
        } catch (error) {
          console.warn('⚠️ Failed to sync journal:', error);
          this.isSyncing = false;
          return;
        }
      }

      for (const entry of unsyncedEntries) {
        try {
          if (entry.id) {
            await journalApiService.updateEntryTimes(
              journal.id,
              entry.id,
              entry.arrivalTime
                ? Timestamp.fromMillis(entry.arrivalTime).toDate()
                : undefined,
              entry.departureTime
                ? Timestamp.fromMillis(entry.departureTime).toDate()
                : undefined,
            );
          } else {
            const backendEntry = await journalApiService.addJournalEntry(
              journal.id,
              entry.name || 'Untitled',
              entry.location,
              entry.images,
              entry.thought,
            );

            entry.id = backendEntry.id;
          }

          entry.synced = true;
          console.info(
            '✅ Synced entry:',
            entry.location.value || 'unknown location',
          );
        } catch (error) {
          console.warn('⚠️ Failed to sync entry:', error);
        }
      }

      await AsyncStorage.setItem(CURRENT_JOURNAL, JSON.stringify(journal));
      console.info('✅ Sync complete');
    } catch (error) {
      console.error('❌ Error syncing pending entries:', error);
    } finally {
      this.isSyncing = false;
    }
  };

  getUnsyncedCount = async (): Promise<number> => {
    try {
      const journal = await this.getTodaysJournal();
      return journal.entries.filter((entry) => !entry.synced).length;
    } catch (error) {
      console.error('❌ Error getting unsynced count:', error);
      return 0;
    }
  };

  fetchTodayJournalFromBackend = async (): Promise<void> => {
    try {
      const status = await journalApiService.getTodayStatus();

      if (status.journal) {
        const localJournal: ILocalJournal = {
          ...status.journal,
          date: getTodayDateString(),
          entries: (status.journal.entries || []).map((entry) => ({
            ...entry,
            arrivalTime:
              entry.arrivalTime instanceof Date
                ? entry.arrivalTime.getTime()
                : entry.arrivalTime.toMillis(),
            departureTime: entry.departureTime
              ? entry.departureTime instanceof Date
                ? entry.departureTime.getTime()
                : entry.departureTime.toMillis()
              : undefined,
            localId: entry.id || generateId(),
            synced: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })),
          localId: status.journal.id || generateId(),
          synced: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await AsyncStorage.setItem(
          CURRENT_JOURNAL,
          JSON.stringify(localJournal),
        );
        console.info('✅ Fetched today\'s journal from backend');
      }
    } catch (error) {
      console.error('❌ Error fetching today\'s journal:', error);
    }
  };

  private reverseGeocode = async (
    latitude: number,
    longitude: number,
  ): Promise<ILocation | undefined> => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results && results.length > 0) {
        const address = results[0];
        const parts = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean);

        const value = parts.join(', ');

        return {
          place: address.name || undefined,
          street: address.street || undefined,
          city: address.city || undefined,
          region: address.region || undefined,
          country: address.country || undefined,
          value,
          coordinate: {latitude, longitude},
        };
      }
    } catch (error) {
      console.warn('⚠️ Geocoding failed:', error);
    }

    return undefined;
  };
}

export default JournalService.getInstance();
