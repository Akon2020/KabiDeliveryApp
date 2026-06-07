import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'fr' | 'en';
export type AppThemeMode = 'system' | 'light' | 'dark';

interface Settings {
  language: AppLanguage;
  themeMode: AppThemeMode;
  notificationsEnabled: boolean;
}

const STORAGE_KEY = 'khabi_settings';

const DEFAULTS: Settings = {
  language: 'fr',
  themeMode: 'system',
  notificationsEnabled: true,
};

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) });
          } catch {}
        }
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const persist = useCallback((next: Settings) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return {
    ...settings,
    isHydrated,
    update,
  };
});
