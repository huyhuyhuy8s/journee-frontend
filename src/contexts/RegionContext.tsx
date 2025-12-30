import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState} from "react";
import {DEFAULT_REGION, REGION_UPDATE_THRESHOLD} from "@/features/map/utils/constants";
import {IRegion} from "@/types";
import {isUndefined} from "lodash";
import {ASYNC_STORAGE_KEYS} from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import locationUpdateService from "@/services/locationUpdateService";

const {CURRENT_LOCATION} = ASYNC_STORAGE_KEYS

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
})

interface IRegionProviderProps {
  children: ReactNode;
}

export const RegionProvider = (props: IRegionProviderProps) => {
  const [region, setRegion] = useState<IRegion>(DEFAULT_REGION)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const regionRef = useRef<IRegion>(region);

  // Keep ref in sync with state
  useEffect(() => {
    regionRef.current = region;
  }, [region]);

  // Load initial location from AsyncStorage
  useEffect(() => {
    const loadInitialLocation = async () => {
      try {
        setIsLoading(true)
        const currentLocationStr = await AsyncStorage.getItem(CURRENT_LOCATION)
        if (currentLocationStr) {
          const currentLocation = JSON.parse(currentLocationStr)
          setRegion(currentLocation)
          console.log('🗺️ Loaded initial region from storage');
        }
      } catch (error) {
        console.error('❌ Error loading initial location:', error);
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialLocation()
  }, []);

  // Subscribe to location updates via event emitter (replaces polling)
  useEffect(() => {
    const unsubscribe = locationUpdateService.onLocationUpdate((newLocation) => {
      const currentRegion = regionRef.current;
      if (
        Math.abs(newLocation.latitude - currentRegion.latitude) > REGION_UPDATE_THRESHOLD ||
        Math.abs(newLocation.longitude - currentRegion.longitude) > REGION_UPDATE_THRESHOLD
      ) {
        setRegion(newLocation)
        console.log('🗺️ Updated region from location event');
      }
    });

    return unsubscribe;
  }, []);

  const value = {region, setRegion, isLoading, setIsLoading}

  return (
    <RegionContext.Provider value={value}>
      {props.children}
    </RegionContext.Provider>
  )
}

export const useRegion = () => {
  const context = useContext(RegionContext);

  const setRegion = (region: IRegion) => context.setRegion(region)
  const setIsLoading = (isLoading: boolean) => context.setIsLoading(isLoading)


  if (isUndefined(context)) {
    throw new Error('useRegion must be used within a RegionProvider');
  }

  return {
    region: context.region,
    setRegion,
    isLoading: context.isLoading,
    setIsLoading
  };
}