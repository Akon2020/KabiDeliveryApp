import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { XCircle, RotateCcw, Home, AlertTriangle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { usePayment } from '@/providers/PaymentProvider';
import * as Haptics from 'expo-haptics';

export default function PaymentFailedScreen() {
  const { orderId, paymentId } = useLocalSearchParams<{ orderId: string; paymentId: string }>();
  const { orders } = useOrders();
  const { currentPayment } = usePayment();

  const order = orders.find((o) => o.id === orderId);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim, fadeAnim]);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace({
      pathname: '/(client-tabs)/home/payment-method' as any,
      params: { orderId },
    });
  };

  const total = order ? order.totalAmount + order.deliveryFee : currentPayment?.total ?? 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerShown: false }} />

      <View style={styles.content}>
        <Animated.View style={[styles.iconCircle, { transform: [{ translateX: shakeAnim }] }]}>
          <XCircle size={56} color={theme.error} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View style={[styles.textBlock, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Paiement échoué</Text>
          <Text style={styles.subtitle}>
            La transaction de {total.toLocaleString()} FC n&apos;a pas abouti
          </Text>

          <View style={styles.reasonCard}>
            <AlertTriangle size={20} color={theme.accent} strokeWidth={2} />
            <Text style={styles.reasonText}>
              {currentPayment?.failureReason ??
                "Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer."}
            </Text>
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Conseils</Text>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Vérifiez votre solde mobile money</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Assurez-vous que le numéro est correct</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Confirmez la transaction sur votre téléphone</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Essayez un autre moyen de paiement</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.9}
          testID="retry-payment"
        >
          <RotateCcw size={20} color="#FFF" strokeWidth={2} />
          <Text style={styles.retryButtonText}>Réessayer le paiement</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(client-tabs)/home' as any)}
          activeOpacity={0.85}
        >
          <Home size={18} color={theme.textSecondary} strokeWidth={2} />
          <Text style={styles.homeButtonText}>Retour à l&apos;accueil</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  textBlock: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.accentLight,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 18,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.primary,
  },
  tipText: {
    fontSize: 13,
    color: theme.textSecondary,
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 10,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.error,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: theme.error,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: theme.textSecondary,
  },
});
