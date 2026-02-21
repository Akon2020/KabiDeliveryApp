import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { MapPin, FileText, ShoppingBag } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useCart } from '@/providers/CartProvider';
import { useOrders } from '@/providers/OrdersProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Order } from '@/types';
import { generateOrderTimeline } from '@/mocks/orders';
import * as Haptics from 'expo-haptics';

export default function CheckoutScreen() {
  const { items, totalAmount, deliveryFee, clearCart, activeServiceId } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState<string>('45 Av. du Commerce, Lingwala, Kinshasa');
  const [notes, setNotes] = useState<string>('');

  const handleOrder = useCallback(() => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse de livraison');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const order: Order = {
      id: orderId,
      clientId: user?.id ?? 'client-001',
      serviceType: (activeServiceId as Order['serviceType']) ?? 'food',
      items: [...items],
      totalAmount,
      deliveryFee,
      status: 'pending',
      pickupAddress: 'Point de retrait, Kinshasa',
      deliveryAddress,
      clientName: user?.name ?? 'Isaac Akonkwa',
      clientPhone: user?.phone ?? '+243810000001',
      notes: notes || undefined,
      timeline: generateOrderTimeline('pending'),
      createdAt: new Date().toISOString(),
      estimatedDelivery: '30-45 min',
      deliveryPin: pin,
    };

    addOrder(order);
    clearCart();

    router.replace({
      pathname: '/(client-tabs)/home/payment-method' as any,
      params: { orderId },
    });
  }, [deliveryAddress, notes, items, totalAmount, deliveryFee, user, activeServiceId, addOrder, clearCart]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Checkout' }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={theme.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          </View>
          <TextInput
            style={styles.addressInput}
            placeholder="Entrez votre adresse"
            placeholderTextColor={theme.textLight}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            testID="address-input"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={theme.accent} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Notes pour le livreur</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="Instructions spéciales (optionnel)"
            placeholderTextColor={theme.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            testID="notes-input"
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <ShoppingBag size={18} color={theme.primary} strokeWidth={2} />
            <Text style={styles.summaryTitle}>Récapitulatif de la commande</Text>
          </View>
          {items.map((item) => (
            <View key={item.product.id} style={styles.summaryRow}>
              <Text style={styles.summaryItemName}>
                {item.quantity}x {item.product.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                {(item.product.price * item.quantity).toLocaleString()} FC
              </Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{totalAmount.toLocaleString()} FC</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} FC</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {(totalAmount + deliveryFee).toLocaleString()} FC
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleOrder}
          activeOpacity={0.9}
          testID="place-order"
        >
          <Text style={styles.orderButtonText}>Confirmer la commande</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
  },
  addressInput: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    fontSize: 15,
    color: theme.text,
    minHeight: 56,
  },
  notesInput: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    fontSize: 15,
    color: theme.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryItemName: {
    fontSize: 14,
    color: theme.textSecondary,
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.text,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.divider,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: theme.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: theme.primary,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: theme.bg,
  },
  orderButton: {
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
  orderButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
});
