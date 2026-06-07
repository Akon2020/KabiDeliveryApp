import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '@/mocks/data';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Region extends Coordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

const KINSHASA_NEIGHBORHOODS = [
  'Gombe', 'Lingwala', 'Kinshasa', 'Kasa-Vubu', 'Barumbu',
  'Kalamu', 'Ngiri-Ngiri', 'Bandalungwa', 'Selembao', 'Ngaliema',
  'Limete', 'Masina', 'Kimbanseke', 'N\'djili', 'Mont-Ngafula',
];

function mockReverseGeocode(coords: Coordinates): string {
  const seed = Math.abs(Math.floor((coords.latitude + coords.longitude) * 1000)) % KINSHASA_NEIGHBORHOODS.length;
  const street = Math.abs(Math.floor(coords.latitude * 10000)) % 200 + 1;
  return `${street} Av. ${KINSHASA_NEIGHBORHOODS[seed]}, Kinshasa`;
}

export const [LocationProvider, useLocation] = createContextHook(() => {
  const [coords, setCoords] = useState<Coordinates>({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
  });
  const [address, setAddress] = useState<string>('Kinshasa, RDC');
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (Platform.OS === 'web') {
      console.log('[Location] Web platform — using default location');
      return null;
    }
    setIsLoading(true);
    try {
      const perm = await Location.getForegroundPermissionsAsync().catch(() => null);
      if (!perm || perm.status !== 'granted') {
        console.log('[Location] Permission not granted, keeping default');
        if (mountedRef.current) setHasPermission(false);
        return null;
      }
      if (mountedRef.current) setHasPermission(true);

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      console.log('[Location] Got position:', next);
      if (mountedRef.current) {
        setCoords(next);
        setAddress(mockReverseGeocode(next));
      }
      return next;
    } catch (err) {
      console.log('[Location] refreshLocation error:', err);
      return null;
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  const region: Region = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: DEFAULT_LOCATION.latitudeDelta,
    longitudeDelta: DEFAULT_LOCATION.longitudeDelta,
  };

  return {
    coords,
    region,
    address,
    hasPermission,
    isLoading,
    refreshLocation,
    mockReverseGeocode,
  };
});
