import { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { theme } from '@/constants/theme';
import { usePayment } from '@/providers/PaymentProvider';
import { PAYMENT_METHODS } from '@/mocks/payments';
import * as Haptics from 'expo-haptics';

export default function PaymentProcessingScreen() {
  const { orderId, paymentId } = useLocalSearchParams<{ orderId: string; paymentId: string }>();
  const { processPayment, currentPayment } = usePayment();

  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    const dotLoop = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    dotLoop(dotAnim1, 0);
    dotLoop(dotAnim2, 200);
    dotLoop(dotAnim3, 400);
  }, [spinAnim, pulseAnim, dotAnim1, dotAnim2, dotAnim3]);

  const handleProcess = useCallback(async () => {
    if (!paymentId) return;
    console.log('[PaymentProcessing] Starting processing for:', paymentId);
    const result = await processPayment(paymentId);

    if (result === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: '/(client-tabs)/home/payment-success' as any,
        params: { orderId, paymentId },
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      router.replace({
        pathname: '/(client-tabs)/home/payment-failed' as any,
        params: { orderId, paymentId },
      });
    }
  }, [paymentId, orderId, processPayment]);

  useEffect(() => {
    handleProcess();
  }, [handleProcess]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const methodLabel = currentPayment?.method === 'mpesa'
    ? 'M-Pesa'
    : currentPayment?.method === 'airtel'
    ? 'Airtel Money'
    : currentPayment?.method === 'orange'
    ? 'Orange Money'
    : 'Cash';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerShown: false }} />

      <View style={styles.content}>
        <Animated.View style={[styles.loaderOuter, { transform: [{ scale: pulseAnim }] }]}>
          <Animated.View style={[styles.loaderInner, { transform: [{ rotate: spin }] }]}>
            <View style={styles.loaderArc} />
          </Animated.View>
          <View style={styles.loaderCenter}>
            {(() => {
              const methodData = PAYMENT_METHODS.find((m) => m.id === currentPayment?.method);
              if (methodData?.iconUrl) {
                return (
                  <Image
                    source={{ uri: methodData.iconUrl }}
                    style={styles.loaderLogo}
                    resizeMode="contain"
                  />
                );
              }
              return <Text style={styles.loaderIcon}>{methodData?.icon ?? '💵'}</Text>;
            })()}
          </View>
        </Animated.View>

        <Text style={styles.title}>Paiement en cours</Text>
        <Text style={styles.subtitle}>
          Validation via {methodLabel}
        </Text>

        <View style={styles.dotsRow}>
          {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.3],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {currentPayment?.phoneNumber && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Numéro</Text>
            <Text style={styles.infoValue}>{currentPayment.phoneNumber}</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Montant</Text>
          <Text style={styles.infoValue}>{currentPayment?.total?.toLocaleString()} FC</Text>
        </View>

        <Text style={styles.hint}>
          Veuillez confirmer la transaction sur votre téléphone si nécessaire
        </Text>
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
  loaderOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  loaderInner: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  loaderArc: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: theme.primary,
    borderRightColor: theme.primary,
  },
  loaderCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  loaderIcon: {
    fontSize: 32,
  },
  loaderLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
  },
  hint: {
    fontSize: 13,
    color: theme.textLight,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 19,
  },
});
