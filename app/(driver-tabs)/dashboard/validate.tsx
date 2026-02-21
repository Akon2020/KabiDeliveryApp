import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ShieldCheck, Camera, CheckCircle, CreditCard, AlertTriangle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import * as Haptics from 'expo-haptics';

export default function ValidateDeliveryScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const { missions, updateMissionStatus } = useOrders();
  const [pin, setPin] = useState<string>('');
  const [photoTaken, setPhotoTaken] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const successAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const mission = missions.find((m) => m.id === missionId);

  const handleClearPin = useCallback(() => {
    setPin('');
    setPinError('');
  }, []);

  const handleValidate = useCallback(() => {
    if (!mission) return;

    if (pin !== mission.deliveryPin) {
      setPinError('Code PIN incorrect. Veuillez réessayer.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!photoTaken) {
      Alert.alert('Photo requise', 'Veuillez prendre une photo comme preuve de livraison avant de valider.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPaymentConfirmed(true);
    updateMissionStatus(mission.id, 'delivered');
    setIsComplete(true);

    Animated.parallel([
      Animated.timing(successAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      router.replace('/(driver-tabs)/dashboard' as any);
    }, 2500);
  }, [mission, pin, updateMissionStatus, successAnim, scaleAnim]);

  const handleTakePhoto = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotoTaken(true);
  }, []);

  if (isComplete) {
    return (
      <View style={styles.successContainer}>
        <Stack.Screen options={{ title: '', headerShown: false }} />
        <Animated.View
          style={[
            styles.successContent,
            {
              opacity: successAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successCircle}>
            <CheckCircle size={64} color={theme.success} strokeWidth={1.5} />
          </View>
          <Text style={styles.successTitle}>Livraison validée !</Text>
          <Text style={styles.successDesc}>
            Félicitations ! Vous avez gagné{' '}
            <Text style={styles.successFee}>{mission?.deliveryFee.toLocaleString()} FC</Text>
          </Text>
          <View style={styles.paymentBadge}>
            <CreditCard size={18} color={theme.success} strokeWidth={2} />
            <Text style={styles.paymentBadgeText}>Paiement confirmé</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  if (!mission) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Validation' }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Mission introuvable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Valider la livraison' }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerCard}>
          <ShieldCheck size={36} color={theme.primary} strokeWidth={1.8} />
          <Text style={styles.headerTitle}>Confirmation de livraison</Text>
          <Text style={styles.headerDesc}>
            Demandez le code PIN au client et prenez une photo comme preuve
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Code PIN du client</Text>
          <Text style={styles.sectionDesc}>
            Demandez le code à 4 chiffres au client {mission.clientName}
          </Text>
          <View style={styles.pinInputRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinBox,
                  pin.length === i && styles.pinBoxFocused,
                  pin[i] && styles.pinBoxFilled,
                  pinError && styles.pinBoxError,
                ]}
              >
                <Text style={styles.pinBoxText}>{pin[i] ?? ''}</Text>
              </View>
            ))}
          </View>
          <TextInput
            style={styles.hiddenInput}
            value={pin}
            onChangeText={(text) => {
              setPin(text.replace(/[^0-9]/g, '').slice(0, 4));
              setPinError('');
            }}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            testID="pin-input"
          />
          {pinError ? (
            <View style={styles.pinErrorRow}>
              <Text style={styles.pinError}>{pinError}</Text>
              <TouchableOpacity
                style={styles.pinRetryButton}
                onPress={handleClearPin}
                activeOpacity={0.7}
                testID="retry-pin"
              >
                <Text style={styles.pinRetryText}>Modifier le PIN</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo de preuve</Text>
          <Text style={styles.sectionDesc}>
            Prenez une photo du colis remis au client
          </Text>
          <TouchableOpacity
            style={[styles.photoButton, photoTaken && styles.photoButtonDone]}
            onPress={handleTakePhoto}
            activeOpacity={0.85}
          >
            {photoTaken ? (
              <>
                <CheckCircle size={24} color={theme.success} strokeWidth={2} />
                <Text style={[styles.photoButtonText, { color: theme.success }]}>Photo prise ✓</Text>
              </>
            ) : (
              <>
                <Camera size={24} color={theme.primary} strokeWidth={2} />
                <Text style={styles.photoButtonText}>Prendre une photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.clientLabel}>Client</Text>
          <Text style={styles.clientValue}>{mission.clientName}</Text>
          <Text style={styles.clientPhone}>{mission.clientPhone}</Text>
        </View>

        {!photoTaken && (
          <View style={styles.warningCard}>
            <AlertTriangle size={18} color={theme.accent} strokeWidth={2} />
            <Text style={styles.warningText}>
              La photo de preuve est obligatoire pour clôturer la livraison
            </Text>
          </View>
        )}

        {paymentConfirmed && (
          <View style={styles.paymentConfirmCard}>
            <CreditCard size={20} color={theme.success} strokeWidth={2} />
            <View style={styles.paymentConfirmInfo}>
              <Text style={styles.paymentConfirmTitle}>Paiement client confirmé</Text>
              <Text style={styles.paymentConfirmAmount}>{mission.totalAmount.toLocaleString()} FC</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.validateButton,
            (pin.length !== 4 || !photoTaken) && styles.validateButtonDisabled,
          ]}
          onPress={handleValidate}
          disabled={pin.length !== 4 || !photoTaken}
          activeOpacity={0.9}
          testID="validate-delivery"
        >
          <Text style={styles.validateButtonText}>Confirmer la livraison</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: theme.primaryLight,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.text,
    marginTop: 12,
    marginBottom: 6,
  },
  headerDesc: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  pinInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  pinBox: {
    width: 60,
    height: 68,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBoxFocused: {
    borderColor: theme.primary,
  },
  pinBoxFilled: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryLight,
  },
  pinBoxError: {
    borderColor: theme.error,
  },
  pinBoxText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  pinErrorRow: {
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  pinError: {
    fontSize: 13,
    color: theme.error,
    textAlign: 'center',
  },
  pinRetryButton: {
    backgroundColor: theme.errorLight,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pinRetryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.error,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
    paddingVertical: 24,
  },
  photoButtonDone: {
    borderColor: theme.success,
    borderStyle: 'solid',
    backgroundColor: theme.successLight,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  clientInfo: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  clientLabel: {
    fontSize: 12,
    color: theme.textLight,
    marginBottom: 4,
  },
  clientValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: theme.bg,
  },
  validateButton: {
    backgroundColor: theme.success,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: theme.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  validateButtonDisabled: {
    opacity: 0.5,
  },
  validateButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  successContainer: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successContent: {
    alignItems: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 10,
  },
  successDesc: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  successFee: {
    fontWeight: '800' as const,
    color: theme.accent,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.successLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 20,
  },
  paymentBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.success,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.accentLight,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.accent,
    fontWeight: '500' as const,
    lineHeight: 19,
  },
  paymentConfirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.successLight,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 16,
  },
  paymentConfirmInfo: {
    flex: 1,
  },
  paymentConfirmTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.success,
    marginBottom: 2,
  },
  paymentConfirmAmount: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: theme.text,
  },
});
