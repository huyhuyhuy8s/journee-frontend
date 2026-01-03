export interface ILocation {
  place?: string;
  street?: string;
  city?: string;
  subregion?: string;
  region?: string;
  country?: string;
  value?: string;
  coordinate: ICoordinate;
}

export interface ICoordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
