import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { CheckCircle, Receipt, Home, ArrowRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { usePayment } from '@/providers/PaymentProvider';
import { useCart } from '@/providers/CartProvider';

export default function PaymentSuccessScreen() {
  const { orderId, paymentId } = useLocalSearchParams<{ orderId: string; paymentId: string }>();
  const { orders } = useOrders();
  const { currentPayment } = usePayment();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  const order = orders.find((o) => o.id === orderId);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [scaleAnim, fadeAnim, slideAnim]);

  const total = order ? order.totalAmount + order.deliveryFee : currentPayment?.total ?? 0;
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
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
          <CheckCircle size={56} color={theme.success} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View
          style={[
            styles.textBlock,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.title}>Paiement réussi !</Text>
          <Text style={styles.subtitle}>
            Votre paiement de {total.toLocaleString()} FC a été confirmé
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Commande</Text>
              <Text style={styles.detailValue}>{orderId}</Text>
            </View>
            <View style={styles.detailSep} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Moyen de paiement</Text>
              <Text style={styles.detailValue}>{methodLabel}</Text>
            </View>
            <View style={styles.detailSep} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Montant</Text>
              <Text style={[styles.detailValue, { color: theme.success, fontWeight: '700' as const }]}>
                {total.toLocaleString()} FC
              </Text>
            </View>
            {currentPayment?.transactionRef && (
              <>
                <View style={styles.detailSep} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Réf. transaction</Text>
                  <Text style={styles.detailValue}>{currentPayment.transactionRef}</Text>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={() =>
            router.push({
              pathname: '/(client-tabs)/home/receipt' as any,
              params: { orderId, paymentId },
            })
          }
          activeOpacity={0.85}
          testID="view-receipt"
        >
          <Receipt size={18} color={theme.primary} strokeWidth={2} />
          <Text style={styles.receiptButtonText}>Voir le reçu</Text>
          <ArrowRight size={16} color={theme.primary} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => router.replace('/(client-tabs)/orders' as any)}
          activeOpacity={0.9}
          testID="track-order"
        >
          <Text style={styles.trackButtonText}>Suivre ma commande</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(client-tabs)/home' as any)}
          activeOpacity={0.85}
        >
          <Home size={18} color={theme.primary} strokeWidth={2} />
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
    backgroundColor: theme.successLight,
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
    marginBottom: 28,
  },
  detailsCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailSep: {
    height: 1,
    backgroundColor: theme.divider,
    marginVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 10,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primaryLight,
    borderRadius: 14,
    paddingVertical: 14,
  },
  receiptButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  trackButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  trackButtonText: {
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
    color: theme.primary,
  },
});
