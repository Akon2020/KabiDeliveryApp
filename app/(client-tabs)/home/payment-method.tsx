import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { CreditCard, Check, Smartphone } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { usePayment } from '@/providers/PaymentProvider';
import { PaymentMethod } from '@/types';
import { PAYMENT_METHODS } from '@/mocks/payments';
import * as Haptics from 'expo-haptics';

export default function PaymentMethodScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders } = useOrders();
  const { initiatePayment } = usePayment();

  const order = orders.find((o) => o.id === orderId);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('+243');

  const needsPhone = selectedMethod && selectedMethod !== 'cash';

  const handleProceed = useCallback(() => {
    if (!selectedMethod || !order) return;

    if (needsPhone && phoneNumber.length < 10) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const payment = initiatePayment(
      order.id,
      selectedMethod,
      order.totalAmount + order.deliveryFee,
      0,
      needsPhone ? phoneNumber : undefined
    );

    if (selectedMethod === 'cash') {
      router.replace({
        pathname: '/(client-tabs)/home/payment-success' as any,
        params: { orderId: order.id, paymentId: payment.id },
      });
    } else {
      router.replace({
        pathname: '/(client-tabs)/home/payment-processing' as any,
        params: { orderId: order.id, paymentId: payment.id },
      });
    }
  }, [selectedMethod, order, phoneNumber, needsPhone, initiatePayment]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Paiement' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Commande introuvable</Text>
        </View>
      </View>
    );
  }

  const total = order.totalAmount + order.deliveryFee;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Paiement' }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Montant à payer</Text>
          <Text style={styles.amountValue}>{total.toLocaleString()} FC</Text>
          <View style={styles.amountBreakdown}>
            <Text style={styles.breakdownText}>
              Articles: {order.totalAmount.toLocaleString()} FC
            </Text>
            <Text style={styles.breakdownDot}>•</Text>
            <Text style={styles.breakdownText}>
              Livraison: {order.deliveryFee.toLocaleString()} FC
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choisir un moyen de paiement</Text>

        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                isSelected && styles.methodCardSelected,
                isSelected && { borderColor: method.color },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedMethod(method.id);
              }}
              activeOpacity={0.85}
              testID={`payment-method-${method.id}`}
            >
              <View style={[styles.methodIconBg, { backgroundColor: method.bg }]}>
                {method.iconUrl ? (
                  <Image
                    source={{ uri: method.iconUrl }}
                    style={styles.methodLogoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.methodIcon}>{method.icon}</Text>
                )}
              </View>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodLabel, isSelected && { color: method.color }]}>
                  {method.label}
                </Text>
                <Text style={styles.methodDesc}>{method.description}</Text>
              </View>
              {isSelected ? (
                <View style={[styles.checkCircle, { backgroundColor: method.color }]}>
                  <Check size={14} color="#FFF" strokeWidth={3} />
                </View>
              ) : (
                <View style={styles.radioCircle} />
              )}
            </TouchableOpacity>
          );
        })}

        {needsPhone && (
          <View style={styles.phoneSection}>
            <Text style={styles.phoneLabel}>Numéro {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}</Text>
            <View style={styles.phoneInputRow}>
              <Smartphone size={20} color={theme.primary} strokeWidth={2} />
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+243 8XX XXX XXX"
                placeholderTextColor={theme.textLight}
                keyboardType="phone-pad"
                testID="payment-phone"
              />
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payButton, !selectedMethod && styles.payButtonDisabled]}
          onPress={handleProceed}
          disabled={!selectedMethod}
          activeOpacity={0.9}
          testID="proceed-payment"
        >
          <CreditCard size={20} color="#FFF" strokeWidth={2} />
          <Text style={styles.payButtonText}>
            {selectedMethod === 'cash' ? 'Confirmer le paiement cash' : 'Payer maintenant'}
          </Text>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  amountCard: {
    backgroundColor: theme.primaryDark,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500' as const,
    marginBottom: 6,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#FFF',
    marginBottom: 10,
  },
  amountBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  breakdownDot: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 14,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  methodCardSelected: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  methodIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  methodLogoImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  methodIcon: {
    fontSize: 22,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: theme.border,
  },
  phoneSection: {
    marginTop: 16,
    marginBottom: 10,
  },
  phoneLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 10,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500' as const,
    color: theme.text,
    paddingVertical: 14,
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
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  payButtonDisabled: {
    opacity: 0.45,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
});
