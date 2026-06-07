import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotifModule = {
  setNotificationHandler: (handler: { handleNotification: () => Promise<unknown> }) => void;
  setNotificationChannelAsync: (id: string, opts: Record<string, unknown>) => Promise<unknown>;
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  scheduleNotificationAsync: (opts: {
    content: { title: string; body: string; data?: Record<string, unknown> };
    trigger: null;
  }) => Promise<unknown>;
  AndroidImportance: { DEFAULT: number };
};

let NotifRef: NotifModule | null = null;
let NotifLoadFailed = false;

function loadNotif(): NotifModule | null {
  if (NotifRef || NotifLoadFailed) return NotifRef;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    NotifRef = require('expo-notifications') as NotifModule;
    return NotifRef;
  } catch (err) {
    console.log('[Notifications] expo-notifications unavailable:', err);
    NotifLoadFailed = true;
    return null;
  }
}

const ENABLED_KEY = 'khabi_notifications_enabled';

export const [NotificationsProvider, useNotifications] = createContextHook(() => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const configuredRef = useRef<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(ENABLED_KEY)
      .then((v) => setIsEnabled(v !== 'false'))
      .catch(() => {});

    const Notif = loadNotif();
    if (!Notif) return;

    if (!configuredRef.current) {
      configuredRef.current = true;
      try {
        Notif.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
        if (Platform.OS === 'android') {
          Notif.setNotificationChannelAsync('default', {
            name: 'Notifications Kabi',
            importance: Notif.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#258675',
          }).catch(() => {});
        }
      } catch (e) {
        console.log('[Notifications] setup error', e);
      }
    }

    Notif.getPermissionsAsync()
      .then((p) => setHasPermission(p.status === 'granted'))
      .catch(() => {});
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const Notif = loadNotif();
    if (!Notif) return false;
    try {
      const current = await Notif.getPermissionsAsync();
      let granted = current.status === 'granted';
      if (!granted) {
        const res = await Notif.requestPermissionsAsync();
        granted = res.status === 'granted';
      }
      setHasPermission(granted);
      return granted;
    } catch (e) {
      console.log('[Notifications] request error', e);
      return false;
    }
  }, []);

  const notify = useCallback(
    async (title: string, body: string, data?: Record<string, unknown>) => {
      if (!isEnabled) return;
      const Notif = loadNotif();
      if (!Notif) {
        console.log('[Notifications] (no-op)', title, body);
        return;
      }
      try {
        await Notif.scheduleNotificationAsync({
          content: { title, body, data },
          trigger: null,
        });
      } catch (e) {
        console.log('[Notifications] schedule error', e);
      }
    },
    [isEnabled],
  );

  const setEnabled = useCallback((value: boolean) => {
    setIsEnabled(value);
    AsyncStorage.setItem(ENABLED_KEY, value ? 'true' : 'false').catch(() => {});
  }, []);

  return {
    hasPermission,
    isEnabled,
    requestPermission,
    notify,
    setEnabled,
  };
});
