import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MapPin, Navigation } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

export default function GpsPermissionScreen() {
  const { grantGPS, user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);

    await requestPermissionSafely();

    try {
      await grantGPS.mutateAsync();
    } catch (err) {
      console.error("[GPS] Error persisting GPS grant:", err);
      isProcessingRef.current = false;
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    InteractionManager.runAfterInteractions(() => {
      navigateHome();
    });
  }, [grantGPS, requestPermissionSafely, navigateHome]);

  const handleSkip = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      await grantGPS.mutateAsync();
    } catch (err) {
      console.error("[GPS] Error persisting GPS skip:", err);
      isProcessingRef.current = false;
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
      return;
    }

    InteractionManager.runAfterInteractions(() => {
      navigateHome();
    });
  }, [grantGPS, navigateHome]);

  const finalizeFlow = useCallback(() => {
    if (!grantGPS.isPending) {
      grantGPS.mutate();
    }
    navigateHome();
  }, [grantGPS, navigateHome]);

  const handleAllow = useCallback(async () => {
    if (isRequesting) return;

    setIsRequesting(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (Platform.OS === 'web') {
        finalizeFlow();
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Localisation desactivee',
          'Activez le GPS de votre telephone puis reessayez.'
        );
        return;
      }

      const currentPermission = await Location.getForegroundPermissionsAsync();
      let status = currentPermission.status;

      if (status !== 'granted') {
        const requestedPermission =
          await Location.requestForegroundPermissionsAsync();
        status = requestedPermission.status;
      }

      console.log('[GPS] Permission status:', status);

      if (status === 'granted') {
        finalizeFlow();
        return;
      }

      Alert.alert(
        'Permission requise',
        'Activez la localisation dans les parametres pour une meilleure experience.'
      );
    } catch (err) {
      console.log('[GPS] Error requesting permission:', err);
      Alert.alert(
        'Erreur de localisation',
        "Impossible de demander la permission de localisation sur cet appareil."
      );
    } finally {
      setIsRequesting(false);
    }
  }, [finalizeFlow, isRequesting]);

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
              {isRequesting ? 'Verification...' : 'Autoriser la localisation'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            testID="skip-gps-button"
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  illustration: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  outerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  middleCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(10,143,123,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pulse1: {
    position: "absolute",
    top: 10,
    right: 20,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.accent,
    opacity: 0.5,
  },
  pulse2: {
    position: "absolute",
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
    fontWeight: "700" as const,
    color: theme.text,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
  },
  buttons: {
    width: "100%",
    gap: 16,
  },
  allowButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  allowButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: "500" as const,
  },
});
