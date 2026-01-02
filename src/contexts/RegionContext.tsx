import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {DEFAULT_REGION} from '@/features/map/utils/constants';
import type {IRegion} from '@/types';
import {isUndefined} from 'lodash';
import {ASYNC_STORAGE_KEYS} from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {REGION_UPDATE_THRESHOLD} from '@/utils/location';

const {CURRENT_LOCATION} = ASYNC_STORAGE_KEYS;

interface IRegionContext {
  region: IRegion;
  setRegion: Dispatch<SetStateAction<IRegion>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const RegionContext = createContext<IRegionContext>({
  region: DEFAULT_REGION,
  setRegion: () => {
  },
  isLoading: true,
  setIsLoading: () => {
  },
});

interface IRegionProviderProps {
  children: ReactNode;
}

export const RegionProvider = (props: IRegionProviderProps) => {
  const [region, setRegion] = useState<IRegion>(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const regionRef = useRef(region);

  useEffect(() => {
    regionRef.current = region;
  }, [region]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setIsLoading(true);
        const currentLocationStr = await AsyncStorage.getItem(CURRENT_LOCATION);
        if (currentLocationStr) {
          const currentLocation = JSON.parse(currentLocationStr);

          if (
            Math.abs(currentLocation.latitude - regionRef.current.latitude) >
            REGION_UPDATE_THRESHOLD.latitudeDelta ||
            Math.abs(currentLocation.longitude - regionRef.current.longitude) >
            REGION_UPDATE_THRESHOLD.longitudeDelta
          ) {
            setRegion(currentLocation);
            console.info('🗺️ Updated region from foreground location');
          }
        }
      } catch (error) {
        console.error('❌ Error polling location from storage:', error);
      } finally {
        setIsLoading(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const value = {region, setRegion, isLoading, setIsLoading};

  return (
    <RegionContext.Provider value={value}>
      {props.children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);

  const setRegion = (region: IRegion) => context.setRegion(region);
  const setIsLoading = (isLoading: boolean) => context.setIsLoading(isLoading);

  if (isUndefined(context)) {
    throw new Error('useRegion must be used within a RegionProvider');
  }

  return {
    region: context.region,
    setRegion,
    isLoading: context.isLoading,
    setIsLoading,
  };
};
