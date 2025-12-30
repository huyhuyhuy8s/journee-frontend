import apiClient from '@/utils/apiClient';
import {IEntry, IJournal, ILocation} from '@/types';
import {Timestamp} from '@firebase/firestore';

interface IApiResponse<T> {
  meta: {
    status: number;
    message: string;
    error?: string;
  };
  results?: T;
}

interface ICreateJournalResponse {
  journal: IJournal;
}

interface ICreateEntryResponse {
  entry: IEntry;
}

interface IUpdateEntryResponse {
  entry: IEntry;
}

interface ILocationUpdateResponse {
  journal: {
    id: string;
    name: string;
  };
  entry: {
    id: string;
    name?: string;
    location: ILocation;
    arrivalTime: Timestamp | Date;
    departureTime?: Timestamp | Date;
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
    const response = await apiClient.post<IApiResponse<ICreateJournalResponse>>(
      '/journals',
      {name}
    );
    return response.data.results!.journal;
  };

  getAllJournals = async (): Promise<IJournal[]> => {
    const response = await apiClient.get<IApiResponse<{ journals: IJournal[] }>>(
      '/journals'
    );
    return response.data.results!.journals;
  };

  getJournalById = async (journalId: string): Promise<IJournal> => {
    const response = await apiClient.get<IApiResponse<{ journal: IJournal }>>(
      `/journals/${journalId}`
    );
    return response.data.results!.journal;
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
    thought?: string
  ): Promise<IEntry> => {
    const response = await apiClient.post<IApiResponse<ICreateEntryResponse>>(
      `/journals/${journalId}/entry`,
      {
        name,
        location,
        images: images || [],
        thought,
      }
    );
    return response.data.results!.entry;
  };

  updateJournalEntry = async (
    journalId: string,
    entryId: string,
    updates: {
      name?: string;
      location?: ILocation;
      images?: string[];
      thought?: string;
    }
  ): Promise<IEntry> => {
    const response = await apiClient.patch<IApiResponse<IUpdateEntryResponse>>(
      `/journals/${journalId}/entry/${entryId}`,
      updates
    );
    return response.data.results!.entry;
  };

  updateEntryTimes = async (
    journalId: string,
    entryId: string,
    arrivalTime?: Timestamp | Date,
    departureTime?: Timestamp | Date
  ): Promise<void> => {
    await apiClient.patch(
      `/journals/${journalId}/entry/${entryId}/times`,
      {
        arrivalTime,
        departureTime,
      }
    );
  };

  deleteJournalEntry = async (journalId: string, entryId: string): Promise<void> => {
    await apiClient.delete(`/journals/${journalId}/entry/${entryId}`);
  };

  updateLocation = async (
    coordinate: { latitude: number; longitude: number },
    place?: string,
    street?: string,
    city?: string,
    region?: string,
    country?: string,
    value?: string
  ): Promise<ILocationUpdateResponse> => {
    const response = await apiClient.post<IApiResponse<ILocationUpdateResponse>>(
      '/location',
      {
        coordinate,
        place,
        street,
        city,
        region,
        country,
        value,
      }
    );
    console.log('response update service', response.data)
    return response.data.results!;
  };

  getTodayStatus = async (): Promise<{
    journal: IJournal | null;
    latestEntry: IEntry | null;
  }> => {
    const response = await apiClient.get<
      IApiResponse<{ journal: IJournal | null; latestEntry: IEntry | null }>
    >('/location');
    return response.data.results!;
  };
}

export default JournalApiService.getInstance();