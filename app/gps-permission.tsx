import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  InteractionManager,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MapPin, Navigation } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/providers/LocationProvider';
import { useNotifications } from '@/providers/NotificationsProvider';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

export default function GpsPermissionScreen() {
  const { grantGPS, user } = useAuth();
  const { refreshLocation } = useLocation();
  const { requestPermission: requestNotifPermission } = useNotifications();
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const navigateHome = useCallback(() => {
    if (user?.role === 'driver') {
      router.replace('/(driver-tabs)/dashboard' as any);
    } else {
      router.replace('/(client-tabs)/home' as any);
    }
  }, [user]);

  const finalizeFlow = useCallback(async () => {
    try {
      await grantGPS.mutateAsync();
    } catch (err) {
      console.log('[GPS] Persist error:', err);
    }
    requestNotifPermission().catch(() => {});
    InteractionManager.runAfterInteractions(() => {
      navigateHome();
    });
  }, [grantGPS, navigateHome, requestNotifPermission]);

  const handleAllow = useCallback(async () => {
    if (isRequesting) return;
    setIsRequesting(true);

    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      if (Platform.OS === 'web') {
        await finalizeFlow();
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => true);
      if (!servicesEnabled) {
        Alert.alert(
          'Localisation désactivée',
          'Activez le GPS de votre téléphone puis réessayez.'
        );
        return;
      }

      const current = await Location.getForegroundPermissionsAsync();
      let status = current.status;

      if (status !== 'granted') {
        const requested = await Location.requestForegroundPermissionsAsync();
        status = requested.status;
      }

      console.log('[GPS] Permission status:', status);

      if (status === 'granted') {
        refreshLocation().catch(() => {});
        await finalizeFlow();
        return;
      }

      Alert.alert(
        'Permission requise',
        'Activez la localisation dans les paramètres pour une meilleure expérience.',
        [
          { text: 'Plus tard', style: 'cancel', onPress: () => finalizeFlow() },
          { text: 'Continuer', onPress: () => finalizeFlow() },
        ]
      );
    } catch (err) {
      console.log('[GPS] Error requesting permission:', err);
      await finalizeFlow();
    } finally {
      setIsRequesting(false);
    }
  }, [finalizeFlow, isRequesting, refreshLocation]);

  const handleSkip = useCallback(() => {
    finalizeFlow();
  }, [finalizeFlow]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.illustration}>
          <View style={styles.outerCircle}>
            <View style={styles.middleCircle}>
              <View style={styles.innerCircle}>
                <MapPin size={40} color={theme.primary} strokeWidth={1.8} />
              </View>
            </View>
          </View>
          <View style={styles.pulse1} />
          <View style={styles.pulse2} />
        </View>

        <Text style={styles.title}>Activez la localisation</Text>
        <Text style={styles.description}>
          Pour vous proposer les meilleurs livreurs à proximité et suivre vos
          commandes en temps réel
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.allowButton}
            onPress={handleAllow}
            activeOpacity={0.85}
            disabled={isRequesting}
            testID="allow-gps-button"
          >
            <Navigation size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.allowButtonText}>
              {isRequesting ? 'Vérification...' : 'Autoriser la localisation'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            testID="skip-gps-button"
            disabled={isRequesting}
          >
            <Text style={styles.skipButtonText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustration: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  outerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(10,143,123,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pulse1: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.accent,
    opacity: 0.5,
  },
  pulse2: {
    position: 'absolute',
    bottom: 25,
    left: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
    opacity: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  allowButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  allowButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
});
