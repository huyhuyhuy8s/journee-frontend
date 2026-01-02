import type { MapStyleElement } from 'react-native-maps';

type Mode = 'light' | 'dark';

export interface MapColors {
  background?: string;
  labelsIconVisibilityOff?: boolean;
  labelsTextFill?: string;
  labelsTextStroke?: string;
  administrativeLandParcel?: string;
  poiGeometry?: string;
  poiLabel?: string;
  poiParkGeometry?: string;
  poiParkLabel?: string;
  roadGeometry?: string;
  roadArterialLabel?: string;
  roadHighwayGeometry?: string;
  roadHighwayLabel?: string;
  roadLocalLabel?: string;
  transitLine?: string;
  transitStation?: string;
  waterGeometry?: string;
  waterLabel?: string;
}

/**
 * Provide theme-aware map style. Pass a partial MapColors to override defaults.
 * Usage: getMapStyle("light", themeColors)
 */
export const getMapStyle = (
  mode: Mode,
  colors: Partial<MapColors> = {}
): MapStyleElement[] => {
  const defaultsLight: MapColors = {
    background: '#f5f5f5',
    labelsIconVisibilityOff: true,
    labelsTextFill: '#616161',
    labelsTextStroke: '#f5f5f5',
    administrativeLandParcel: '#bdbdbd',
    poiGeometry: '#eeeeee',
    poiLabel: '#757575',
    poiParkGeometry: '#e5e5e5',
    poiParkLabel: '#9e9e9e',
    roadGeometry: '#ffffff',
    roadArterialLabel: '#757575',
    roadHighwayGeometry: '#dadada',
    roadHighwayLabel: '#616161',
    roadLocalLabel: '#9e9e9e',
    transitLine: '#e5e5e5',
    transitStation: '#eeeeee',
    waterGeometry: '#c9c9c9',
    waterLabel: '#9e9e9e',
  };

  const defaultsDark: MapColors = {
    background: '#212121',
    labelsIconVisibilityOff: true,
    labelsTextFill: '#757575',
    labelsTextStroke: '#212121',
    administrativeLandParcel: undefined,
    poiGeometry: undefined,
    poiLabel: '#757575',
    poiParkGeometry: '#181818',
    poiParkLabel: '#616161',
    roadGeometry: '#2c2c2c',
    roadArterialLabel: '#8a8a8a',
    roadHighwayGeometry: '#3c3c3c',
    roadHighwayLabel: '#8a8a8a',
    roadLocalLabel: '#616161',
    transitLine: undefined,
    transitStation: undefined,
    waterGeometry: '#000000',
    waterLabel: '#3d3d3d',
  };

  // Merge defaults with provided colors
  const theme = {
    ...(mode === 'light' ? defaultsLight : defaultsDark),
    ...(colors || {}),
  };

  if (mode === 'light') {
    return [
      { elementType: 'geometry', stylers: [{ color: theme.background }] },
      {
        elementType: 'labels.icon',
        stylers: [{ visibility: theme.labelsIconVisibilityOff ? 'off' : 'on' }],
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: theme.labelsTextFill }],
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: theme.labelsTextStroke }],
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{ color: theme.administrativeLandParcel }],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: theme.poiGeometry }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: theme.poiLabel }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: theme.poiParkGeometry }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: theme.poiParkLabel }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: theme.roadGeometry }],
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [{ color: theme.roadArterialLabel }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: theme.roadHighwayGeometry }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: theme.roadHighwayLabel }],
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{ color: theme.roadLocalLabel }],
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{ color: theme.transitLine }],
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{ color: theme.transitStation }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: theme.waterGeometry }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: theme.waterLabel }],
      },
    ];
  }

  // dark
  return [
    { elementType: 'geometry', stylers: [{ color: theme.background }] },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: theme.labelsIconVisibilityOff ? 'off' : 'on' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.labelsTextFill }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: theme.labelsTextStroke }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{ color: theme.labelsTextFill }],
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.labelsTextFill }],
    },
    {
      featureType: 'administrative.land_parcel',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.administrativeLandParcel }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.poiLabel }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: theme.poiParkGeometry }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.poiParkLabel }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1b1b1b' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: theme.roadGeometry }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.roadArterialLabel }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#373737' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: theme.roadHighwayGeometry }],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [{ color: '#4e4e4e' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.roadLocalLabel }],
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.labelsTextFill }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: theme.waterGeometry }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: theme.waterLabel }],
    },
  ];
};
