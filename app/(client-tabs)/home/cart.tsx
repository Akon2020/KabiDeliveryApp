import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useCart } from '@/providers/CartProvider';
import * as Haptics from 'expo-haptics';

export default function CartScreen() {
  const { items, totalAmount, deliveryFee, totalItems, updateQuantity, removeItem, clearCart } = useCart();

  const handleRemove = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeItem(productId);
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Mon panier' }} />
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <ShoppingCart size={40} color={theme.textLight} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Panier vide</Text>
          <Text style={styles.emptyText}>Ajoutez des articles depuis le catalogue</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyButtonText}>Parcourir les services</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Mon panier (${totalItems})` }} />

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <View key={item.product.id} style={styles.cartItem}>
            <Image source={{ uri: item.product.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>{item.product.price.toLocaleString()} FC</Text>
              <View style={styles.itemActions}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus size={14} color={theme.primary} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus size={14} color={theme.primary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(item.product.id)}
                >
                  <Trash2 size={16} color={theme.error} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.itemTotal}>
              {(item.product.price * item.quantity).toLocaleString()} FC
            </Text>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{totalAmount.toLocaleString()} FC</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de livraison</Text>
            <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} FC</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>
              {(totalAmount + deliveryFee).toLocaleString()} FC
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            clearCart();
          }}
        >
          <Trash2 size={16} color={theme.error} strokeWidth={2} />
          <Text style={styles.clearButtonText}>Vider le panier</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push('/(client-tabs)/home/checkout' as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.checkoutButtonText}>Commander</Text>
          <View style={styles.checkoutTotal}>
            <Text style={styles.checkoutTotalText}>
              {(totalAmount + deliveryFee).toLocaleString()} FC
            </Text>
            <ArrowRight size={18} color="#FFF" strokeWidth={2.5} />
          </View>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: theme.divider,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.primary,
    minWidth: 18,
    textAlign: 'center',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: theme.text,
    alignSelf: 'center',
  },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: theme.primary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.error,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: theme.bg,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  checkoutTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkoutTotalText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
});
