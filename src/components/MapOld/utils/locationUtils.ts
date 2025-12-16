export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getIntervalText = (interval: number): string => {
  if (interval >= 3600000) return `${interval / 3600000}h`;
  if (interval >= 60000) return `${interval / 60000}min`;
  return `${interval / 1000}s`;
};

export const formatCoordinates = (
  latitude: number,
  longitude: number
): string => {
  return `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
};
