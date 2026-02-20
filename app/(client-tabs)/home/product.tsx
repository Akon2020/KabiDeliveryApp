import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useCart } from '@/providers/CartProvider';
import { PRODUCTS } from '@/mocks/products';
import * as Haptics from 'expo-haptics';

export default function ProductScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { items, addItem, updateQuantity, totalItems, totalAmount } = useCart();

  const product = PRODUCTS.find((p) => p.id === productId);
  const cartItem = items.find((i) => i.product.id === productId);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = useCallback(() => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(product);
  }, [product, addItem]);

  const handleQuantityChange = useCallback(
    (delta: number) => {
      if (!product) return;
      updateQuantity(product.id, qty + delta);
    },
    [product, qty, updateQuantity]
  );

  if (!product) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Produit' }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Produit introuvable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerTransparent: true }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.image }} style={styles.heroImage} />

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{product.category}</Text>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price.toLocaleString()} FC</Text>
            {product.available ? (
              <View style={styles.availableBadge}>
                <Text style={styles.availableBadgeText}>Disponible</Text>
              </View>
            ) : (
              <View style={[styles.availableBadge, { backgroundColor: theme.errorLight }]}>
                <Text style={[styles.availableBadgeText, { color: theme.error }]}>Indisponible</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.addSection}>
            {qty === 0 ? (
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAdd}
                activeOpacity={0.85}
                testID="add-to-cart"
              >
                <ShoppingCart size={20} color="#FFF" strokeWidth={2} />
                <Text style={styles.addToCartText}>Ajouter au panier</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityRow}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleQuantityChange(-1)}
                  >
                    <Minus size={20} color={theme.primary} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleQuantityChange(1)}
                  >
                    <Plus size={20} color={theme.primary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.subtotal}>{(product.price * qty).toLocaleString()} FC</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {totalItems > 0 && (
        <View style={styles.cartBar}>
          <TouchableOpacity
            style={styles.cartBarButton}
            onPress={() => router.push('/(client-tabs)/home/cart' as any)}
            activeOpacity={0.9}
          >
            <View style={styles.cartBarLeft}>
              <View style={styles.cartBarBadge}>
                <Text style={styles.cartBarBadgeText}>{totalItems}</Text>
              </View>
              <Text style={styles.cartBarLabel}>Voir le panier</Text>
            </View>
            <View style={styles.cartBarRight}>
              <Text style={styles.cartBarPrice}>{totalAmount.toLocaleString()} FC</Text>
              <ArrowRight size={18} color="#FFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>
      )}
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
  heroImage: {
    width: '100%',
    height: 280,
    backgroundColor: theme.divider,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: theme.primary,
  },
  availableBadge: {
    backgroundColor: theme.successLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  availableBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.success,
  },
  divider: {
    height: 1,
    backgroundColor: theme.divider,
    marginBottom: 24,
  },
  addSection: {},
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addToCartText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: theme.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  qtyValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.text,
  },
  cartBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: theme.bg,
  },
  cartBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartBarBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBarBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  cartBarLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBarPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
});
