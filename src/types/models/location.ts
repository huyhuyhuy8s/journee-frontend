export interface ILocation {
  place?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  value?: string;
  coordinate: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}