import apiClient from '@/utils/axiosInstance';
import type {IEntry, IJournal, ILocation} from '@/types';

interface ILocationUpdateResponse {
  journal: {
    id: string;
    name: string;
  };
  entry: {
    id: string;
    name?: string;
    location: ILocation;
    arrivalTime: Date;
    departureTime?: Date;
  };
}

export class JournalApiService {
  private static instance: JournalApiService;

  private constructor() {
  }

  static getInstance = (): JournalApiService => {
    if (!JournalApiService.instance) {
      JournalApiService.instance = new JournalApiService();
    }
    return JournalApiService.instance;
  };

  createJournal = async (name: string): Promise<IJournal> => {
    const response = await apiClient.post<{ journal: IJournal }>(
      '/journals',
      {name},
    );
    return response.results.journal;
  };

  getAllJournals = async (): Promise<IJournal[]> => {
    const response =
      await apiClient.get<{ journals: IJournal[] }>('/journals');
    return response.results.journals;
  };

  getJournalById = async (journalId: string): Promise<IJournal> => {
    const response = await apiClient.get<{ journal: IJournal }>(
      `/journals/${journalId}`,
    );
    return response.results.journal;
  };

  updateJournal = async (journalId: string, name: string): Promise<void> => {
    await apiClient.patch(`/journals/${journalId}`, {name});
  };

  deleteJournal = async (journalId: string): Promise<void> => {
    await apiClient.delete(`/journals/${journalId}`);
  };

  addJournalEntry = async (
    journalId: string,
    name: string,
    location: ILocation,
    images?: string[],
    thought?: string,
  ): Promise<IEntry> => {
    const response = await apiClient.post<{ entry: IEntry }>(
      `/journals/${journalId}/entry`,
      {
        name,
        location,
        images: images || [],
        thought,
      },
    );
    return response.results.entry;
  };

  updateJournalEntry = async (
    journalId: string,
    entryId: string,
    updates: {
      name?: string;
      location?: ILocation;
      images?: string[];
      thought?: string;
    },
  ): Promise<IEntry> => {
    const response = await apiClient.patch<{ entry: IEntry }>(
      `/journals/${journalId}/entry/${entryId}`,
      updates,
    );
    return response.results.entry;
  };

  updateEntryTimes = async (
    journalId: string,
    entryId: string,
    arrivalTime?: Date,
    departureTime?: Date,
  ): Promise<void> => {
    await apiClient.patch(`/journals/${journalId}/entry/${entryId}/times`, {
      arrivalTime,
      departureTime,
    });
  };

  deleteJournalEntry = async (
    journalId: string,
    entryId: string,
  ): Promise<void> => {
    await apiClient.delete(`/journals/${journalId}/entry/${entryId}`);
  };

  updateLocation = async (
    coordinate: { latitude: number; longitude: number },
    place?: string,
    street?: string,
    city?: string,
    region?: string,
    country?: string,
    value?: string,
  ): Promise<ILocationUpdateResponse> => {
    const response = await apiClient.post<
      ILocationUpdateResponse
    >('/location', {
      coordinate,
      place,
      street,
      city,
      region,
      country,
      value,
    });
    console.info('response update service', response.meta.message);
    return response.results;
  };

  getTodayStatus = async (): Promise<{
    journal: IJournal | null;
    latestEntry: IEntry | null;
  }> => {
    const response =
      await apiClient.get<
        { journal: IJournal | null; latestEntry: IEntry | null }
      >('/location');
    return response.results;
  };
}

export default JournalApiService.getInstance();
