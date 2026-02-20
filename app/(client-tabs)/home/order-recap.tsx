import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { CheckCircle, MapPin, Clock, Hash, Home } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';

export default function OrderRecapScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders } = useOrders();

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Récapitulatif', headerBackVisible: false }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Commande introuvable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Récapitulatif', headerBackVisible: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <CheckCircle size={48} color={theme.success} strokeWidth={1.5} />
          </View>
          <Text style={styles.successTitle}>Commande confirmée !</Text>
          <Text style={styles.successDesc}>
            Votre commande a été passée avec succès. Un livreur sera assigné sous peu.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Hash size={18} color={theme.primary} strokeWidth={2} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Numéro de commande</Text>
              <Text style={styles.infoValue}>{order.id}</Text>
            </View>
          </View>

          <View style={styles.infoSep} />

          <View style={styles.infoRow}>
            <Clock size={18} color={theme.accent} strokeWidth={2} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Livraison estimée</Text>
              <Text style={styles.infoValue}>{order.estimatedDelivery ?? '30-45 min'}</Text>
            </View>
          </View>

          <View style={styles.infoSep} />

          <View style={styles.infoRow}>
            <MapPin size={18} color={theme.error} strokeWidth={2} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse de livraison</Text>
              <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.pinCard}>
          <Text style={styles.pinLabel}>Code PIN de livraison</Text>
          <View style={styles.pinRow}>
            {order.deliveryPin?.split('').map((digit, i) => (
              <View key={i} style={styles.pinDigit}>
                <Text style={styles.pinDigitText}>{digit}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.pinNote}>
            Communiquez ce code au livreur pour confirmer la réception
          </Text>
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Articles commandés</Text>
          {order.items.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                {(item.product.price * item.quantity).toLocaleString()} FC
              </Text>
            </View>
          ))}
          <View style={styles.itemsSep} />
          <View style={styles.itemRow}>
            <Text style={styles.itemQty} />
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {(order.totalAmount + order.deliveryFee).toLocaleString()} FC
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => router.replace('/(client-tabs)/orders' as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.trackButtonText}>Suivre ma commande</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(client-tabs)/home' as any)}
          activeOpacity={0.8}
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
    paddingBottom: 160,
  },
  successCard: {
    backgroundColor: theme.successLight,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
  },
  infoSep: {
    height: 1,
    backgroundColor: theme.divider,
    marginVertical: 14,
  },
  pinCard: {
    backgroundColor: theme.accentLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.textSecondary,
    marginBottom: 14,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  pinDigit: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pinDigitText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: theme.accent,
  },
  pinNote: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  itemsCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.primary,
    width: 30,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
  },
  itemsSep: {
    height: 1,
    backgroundColor: theme.divider,
    marginVertical: 10,
  },
  totalLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: theme.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: theme.bg,
    gap: 10,
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
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: theme.primaryLight,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.primary,
  },
});
