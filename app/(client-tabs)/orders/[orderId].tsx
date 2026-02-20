import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { MapPin, Phone, User, Clock, Package, CheckCircle, Truck, ChefHat, CircleDot } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { OrderStatus } from '@/types';
import KhabiMap from '@/components/KhabiMap';

const STATUS_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  pending: CircleDot,
  confirmed: CheckCircle,
  preparing: ChefHat,
  pickup_ready: Package,
  in_transit: Truck,
  delivered: CheckCircle,
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders } = useOrders();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (order && order.status !== 'delivered' && order.status !== 'cancelled') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [order?.status, pulseAnim]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Détail commande' }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Commande introuvable</Text>
        </View>
      </View>
    );
  }

  const isActive = order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: order.id }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isActive && (
          <View style={styles.mapSection}>
            <KhabiMap height={200} />
            {order.estimatedDelivery && (
              <View style={styles.etaOverlay}>
                <Clock size={16} color={theme.accent} strokeWidth={2} />
                <Text style={styles.etaText}>{order.estimatedDelivery}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Suivi de commande</Text>
          {order.timeline.map((step, index) => {
            const isLast = index === order.timeline.length - 1;
            const isCurrent = step.completed && (isLast || !order.timeline[index + 1]?.completed);
            const IconComp = STATUS_ICONS[step.status] ?? CircleDot;

            return (
              <View key={step.status} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  {isCurrent && isActive ? (
                    <Animated.View
                      style={[
                        styles.timelineDotActive,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <IconComp size={16} color="#FFF" strokeWidth={2} />
                    </Animated.View>
                  ) : (
                    <View
                      style={[
                        styles.timelineDot,
                        step.completed ? styles.timelineDotCompleted : styles.timelineDotPending,
                      ]}
                    >
                      <IconComp
                        size={14}
                        color={step.completed ? '#FFF' : theme.textLight}
                        strokeWidth={2}
                      />
                    </View>
                  )}
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        step.completed ? styles.timelineLineCompleted : styles.timelineLinePending,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      step.completed && styles.timelineLabelCompleted,
                    ]}
                  >
                    {step.label}
                  </Text>
                  <Text style={styles.timelineTime}>{step.time}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {order.driverName && (
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>
                {order.driverName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{order.driverName}</Text>
              <Text style={styles.driverRole}>Votre livreur</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Phone size={20} color={theme.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View style={[styles.addressDot, { backgroundColor: theme.primary }]} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Retrait</Text>
              <Text style={styles.addressValue}>{order.pickupAddress}</Text>
            </View>
          </View>
          <View style={styles.addressLine} />
          <View style={styles.addressRow}>
            <View style={[styles.addressDot, { backgroundColor: theme.accent }]} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Livraison</Text>
              <Text style={styles.addressValue}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        {order.deliveryPin && (
          <View style={styles.pinCard}>
            <Text style={styles.pinLabel}>Code PIN</Text>
            <Text style={styles.pinValue}>{order.deliveryPin}</Text>
          </View>
        )}

        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Articles</Text>
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
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Livraison</Text>
            <Text style={styles.totalSmall}>{order.deliveryFee.toLocaleString()} FC</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelBig}>Total</Text>
            <Text style={styles.totalValue}>
              {(order.totalAmount + order.deliveryFee).toLocaleString()} FC
            </Text>
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
    paddingBottom: 40,
  },
  mapSection: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  etaOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.accent,
  },
  timelineCard: {
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    width: 36,
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: theme.primary,
  },
  timelineDotPending: {
    backgroundColor: theme.divider,
  },
  timelineDotActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: theme.primary,
  },
  timelineLinePending: {
    backgroundColor: theme.divider,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.textLight,
    marginBottom: 2,
  },
  timelineLabelCompleted: {
    color: theme.text,
    fontWeight: '600' as const,
  },
  timelineTime: {
    fontSize: 12,
    color: theme.textLight,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.accent,
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.text,
  },
  driverRole: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  addressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  addressValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.text,
  },
  addressLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.divider,
    marginLeft: 5,
    marginVertical: 4,
  },
  pinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.accentLight,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.textSecondary,
  },
  pinValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: theme.accent,
    letterSpacing: 6,
  },
  itemsCard: {
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  totalSmall: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.text,
  },
  totalLabelBig: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: theme.primary,
  },
});
