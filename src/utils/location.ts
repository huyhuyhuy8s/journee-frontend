import {SAME_LOCATION_THRESHOLD} from '@/features/map/utils/constants';

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const isSameLocation = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): boolean => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance < SAME_LOCATION_THRESHOLD;
};

const formatInterval = (ms: number): string => {
  if (ms < 60000) {
    return `${ms / 1000}s`;
  } else if (ms < 3600000) {
    return `${ms / 60000}m`;
  } else {
    return `${ms / 3600000}h`;
  }
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export {
  calculateDistance,
  toRad,
  isSameLocation,
  generateId,
  formatInterval,
  getTodayDateString,
};

export const REGION_UPDATE_THRESHOLD = {
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};
