export const DEFAULT_BACKEND_RESPONSE = {
  meta: {
    status: 500,
    message: 'An unexpected error occurred.',
    error: 'Internal Server Error',
  },
  results: null,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
} as const;

export const ASYNC_STORAGE_KEYS = {
  STATE: 'userLocationState',
  HISTORY: 'locationHistory',
  LAST_LOCATION: 'lastLocation',
  CURRENT_LOCATION: 'currentLocation',
  USER_DATA: 'userData',
  CURRENT_JOURNAL: 'currentJournal',
  PENDING_VISIT: 'pendingVisit',
  LOCATION_STATE_CHANGED: 'locationStateChanged',
  LAST_BACKGROUND_PROCESS: 'lastBackgroundProcess',
  LAST_FOREGROUND_PROCESS: 'lastForegroundProcess',
} as const;
