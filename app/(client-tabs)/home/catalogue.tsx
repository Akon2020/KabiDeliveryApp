import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Plus, Minus, ArrowRight, Search, X, SlidersHorizontal, Check } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useCart } from '@/providers/CartProvider';
import { getProductsByService, getProductCategories } from '@/mocks/products';
import { SERVICES } from '@/mocks/services';
import { Product } from '@/types';
import * as Haptics from 'expo-haptics';

type SortKind = 'default' | 'price-asc' | 'price-desc' | 'name';

const SORT_LABELS: Record<SortKind, string> = {
  default: 'Recommandé',
  'price-asc': 'Prix croissant',
  'price-desc': 'Prix décroissant',
  name: 'Nom (A-Z)',
};

export default function CatalogueScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { items, totalItems, totalAmount, addItem, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [query, setQuery] = useState<string>('');
  const [sort, setSort] = useState<SortKind>('default');
  const [sortOpen, setSortOpen] = useState<boolean>(false);

  const service = SERVICES.find((s) => s.id === serviceId);
  const allProducts = useMemo(() => getProductsByService(serviceId ?? ''), [serviceId]);
  const categories = useMemo(() => ['Tous', ...getProductCategories(serviceId ?? '')], [serviceId]);

  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (selectedCategory !== 'Tous') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allProducts, selectedCategory, query, sort]);

  const getItemQuantity = useCallback(
    (productId: string) => {
      return items.find((i) => i.product.id === productId)?.quantity ?? 0;
    },
    [items]
  );

  const handleAdd = useCallback(
    (product: Product) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addItem(product);
    },
    [addItem]
  );

  const handleQuantityChange = useCallback(
    (productId: string, delta: number) => {
      const current = getItemQuantity(productId);
      updateQuantity(productId, current + delta);
    },
    [getItemQuantity, updateQuantity]
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: service?.name ?? 'Catalogue',
          headerShown: true,
        }}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.textLight} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={theme.textLight}
            value={query}
            onChangeText={setQuery}
            testID="catalogue-search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} testID="clear-search">
              <X size={18} color={theme.textLight} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortOpen(true)}
          testID="open-sort"
        >
          <SlidersHorizontal size={18} color={theme.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.productsList}
        contentContainerStyle={styles.productsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 && (
          <View style={styles.emptyResults}>
            <Text style={styles.emptyResultsTitle}>Aucun résultat</Text>
            <Text style={styles.emptyResultsDesc}>
              Essayez une autre recherche ou catégorie.
            </Text>
          </View>
        )}
        {filteredProducts.map((product) => {
          const qty = getItemQuantity(product.id);
          const isUnavailable = !product.available;
          return (
            <TouchableOpacity
              key={product.id}
              style={[styles.productCard, isUnavailable && styles.productCardDisabled]}
              activeOpacity={isUnavailable ? 1 : 0.85}
              disabled={isUnavailable}
              onPress={() =>
                router.push({
                  pathname: '/(client-tabs)/home/product' as any,
                  params: { productId: product.id, serviceId },
                })
              }
            >
              <View>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                {isUnavailable && (
                  <View style={styles.unavailableOverlay}>
                    <Text style={styles.unavailableText}>Indisponible</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
                <View style={styles.productBottom}>
                  <Text style={styles.productPrice}>{product.price.toLocaleString()} FC</Text>
                  {isUnavailable ? (
                    <Text style={styles.unavailableTag}>Bientôt</Text>
                  ) : qty === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAdd(product)}
                      testID={`add-${product.id}`}
                    >
                      <Plus size={18} color="#FFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => handleQuantityChange(product.id, -1)}
                      >
                        <Minus size={14} color={theme.primary} strokeWidth={2.5} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{qty}</Text>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => handleQuantityChange(product.id, 1)}
                      >
                        <Plus size={14} color={theme.primary} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />

      <Modal
        visible={sortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortOpen(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Trier par</Text>
            {(Object.keys(SORT_LABELS) as SortKind[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.sortRow}
                onPress={() => {
                  setSort(s);
                  setSortOpen(false);
                }}
                testID={`sort-${s}`}
              >
                <Text style={styles.sortRowText}>{SORT_LABELS[s]}</Text>
                {sort === s && <Check size={18} color={theme.primary} strokeWidth={2.5} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  categoriesScroll: {
    maxHeight: 56,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  productsList: {
    flex: 1,
  },
  productsContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: {
    width: 110,
    height: 110,
    backgroundColor: theme.divider,
  },
  productInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 17,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.primary,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: theme.primary,
    minWidth: 20,
    textAlign: 'center',
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    paddingVertical: 0,
  },
  sortBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCardDisabled: {
    opacity: 0.65,
  },
  unavailableOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    color: '#FFF',
    fontWeight: '700' as const,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  unavailableTag: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: theme.textLight,
    backgroundColor: theme.divider,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyResultsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 6,
  },
  emptyResultsDesc: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 16,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  sortRowText: {
    fontSize: 15,
    color: theme.text,
  },
});
