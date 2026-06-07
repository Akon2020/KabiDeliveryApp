import { useState, useCallback, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AddressKind = 'home' | 'work' | 'other';

export interface Address {
  id: string;
  label: string;
  kind: AddressKind;
  fullAddress: string;
  details?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

const STORAGE_KEY = 'khabi_addresses';

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-home',
    label: 'Maison',
    kind: 'home',
    fullAddress: '45 Av. du Commerce, Lingwala',
    details: 'Bâtiment vert, 2e étage',
    latitude: -4.3214,
    longitude: 15.3019,
    isDefault: true,
  },
];

function genId(): string {
  return `addr-${Math.random().toString(36).slice(2, 10)}`;
}

export const [AddressesProvider, useAddresses] = createContextHook(() => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          setAddresses(JSON.parse(raw) as Address[]);
        } else {
          setAddresses(DEFAULT_ADDRESSES);
        }
      })
      .catch(() => setAddresses(DEFAULT_ADDRESSES))
      .finally(() => setIsHydrated(true));
  }, []);

  const persist = useCallback((next: Address[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((e) =>
      console.log('[Addresses] persist error', e),
    );
  }, []);

  const addAddress = useCallback(
    (data: Omit<Address, 'id'>): Address => {
      const created: Address = { ...data, id: genId() };
      setAddresses((prev) => {
        let next = [...prev, created];
        if (created.isDefault) {
          next = next.map((a) =>
            a.id === created.id ? a : { ...a, isDefault: false },
          );
        }
        if (next.length === 1) {
          next = next.map((a) => ({ ...a, isDefault: true }));
        }
        persist(next);
        return next;
      });
      return created;
    },
    [persist],
  );

  const updateAddress = useCallback(
    (id: string, patch: Partial<Address>) => {
      setAddresses((prev) => {
        let next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a));
        if (patch.isDefault) {
          next = next.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
        }
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => {
        const wasDefault = prev.find((a) => a.id === id)?.isDefault;
        let next = prev.filter((a) => a.id !== id);
        if (wasDefault && next.length > 0) {
          next = next.map((a, idx) => ({ ...a, isDefault: idx === 0 }));
        }
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setDefault = useCallback(
    (id: string) => {
      setAddresses((prev) => {
        const next = prev.map((a) => ({ ...a, isDefault: a.id === id }));
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  return {
    addresses,
    defaultAddress,
    isHydrated,
    addAddress,
    updateAddress,
    removeAddress,
    setDefault,
  };
});
