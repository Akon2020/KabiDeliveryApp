import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, UtensilsCrossed, ShoppingBag, Pill, Package, Bell, Apple, ShoppingCart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { useOrders } from '@/providers/OrdersProvider';
import { theme } from '@/constants/theme';
import { SERVICES } from '@/mocks/services';
import KhabiMap from '@/components/KhabiMap';
import * as Haptics from 'expo-haptics';

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  UtensilsCrossed,
  ShoppingBag,
  Pill,
  Package,
  Apple,
};

export default function ClientHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { activeOrders } = useOrders();
  const firstName = user?.name?.split(' ')[0] ?? 'Client';

  const handleServicePress = (serviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (serviceId === 'parcel') {
      router.push('/(client-tabs)/home/create-parcel' as any);
    } else {
      router.push({ pathname: '/(client-tabs)/home/catalogue' as any, params: { serviceId } });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{firstName} 👋</Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push('/(client-tabs)/home/cart' as any)}
              testID="cart-button"
            >
              <ShoppingCart size={20} color={theme.primary} strokeWidth={2} />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifButton} testID="notif-button">
              <Bell size={22} color={theme.text} strokeWidth={1.8} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} testID="search-bar">
          <Search size={20} color={theme.textLight} strokeWidth={2} />
          <Text style={styles.searchPlaceholder}>Rechercher un restaurant, produit...</Text>
        </TouchableOpacity>

        {activeOrders.length > 0 && (
          <TouchableOpacity
            style={styles.activeOrderBanner}
            onPress={() => router.push('/(client-tabs)/orders' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.activeOrderDot} />
            <Text style={styles.activeOrderText}>
              {activeOrders.length} commande{activeOrders.length > 1 ? 's' : ''} en cours
            </Text>
            <Text style={styles.activeOrderAction}>Suivre →</Text>
          </TouchableOpacity>
        )}

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map((service) => {
              const IconComp = ICON_MAP[service.icon];
              return (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  activeOpacity={0.8}
                  onPress={() => handleServicePress(service.id)}
                  testID={`service-${service.id}`}
                >
                  <View style={[styles.serviceIcon, { backgroundColor: service.bg }]}>
                    {IconComp && <IconComp size={26} color={service.color} strokeWidth={1.8} />}
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDesc} numberOfLines={1}>{service.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.mapSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Autour de vous</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir la carte</Text>
            </TouchableOpacity>
          </View>
          <KhabiMap height={180} />
        </View>

        <View style={styles.promoSection}>
          <View style={styles.promoCard}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Livraison gratuite</Text>
              <Text style={styles.promoText}>Sur votre première commande avec le code KHABI2024</Text>
            </View>
            <View style={styles.promoIcon}>
              <Package size={32} color={theme.accent} strokeWidth={1.5} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greeting: {
    fontSize: 15,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.text,
    marginTop: 2,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  notifButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent,
    borderWidth: 1.5,
    borderColor: theme.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: theme.textLight,
    flex: 1,
  },
  activeOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  activeOrderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginRight: 10,
  },
  activeOrderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  activeOrderAction: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.primaryDark,
  },
  servicesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600' as const,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  mapSection: {
    marginBottom: 24,
  },
  promoSection: {
    marginBottom: 16,
  },
  promoCard: {
    flexDirection: 'row',
    backgroundColor: theme.accentLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  promoContent: {
    flex: 1,
    marginRight: 16,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 6,
  },
  promoText: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  promoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,122,26,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
