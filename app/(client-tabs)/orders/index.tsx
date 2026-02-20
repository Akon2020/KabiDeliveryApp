import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ClipboardList, MapPin, Clock, ChevronRight, Package } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { Order, OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmée', color: theme.primary, bg: theme.primaryLight },
  preparing: { label: 'En préparation', color: '#8B5CF6', bg: '#F3E8FF' },
  pickup_ready: { label: 'Prête', color: '#2563EB', bg: '#DBEAFE' },
  in_transit: { label: 'En livraison', color: theme.accent, bg: theme.accentLight },
  delivered: { label: 'Livrée', color: theme.success, bg: theme.successLight },
  cancelled: { label: 'Annulée', color: theme.error, bg: theme.errorLight },
};

export default function OrdersScreen() {
  const { activeOrders, pastOrders } = useOrders();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const displayOrders = tab === 'active' ? activeOrders : pastOrders;

  const renderOrder = (order: Order) => {
    const statusConf = STATUS_CONFIG[order.status];
    const firstItem = order.items[0];
    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: '/(client-tabs)/orders/[orderId]' as any,
            params: { orderId: order.id },
          })
        }
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
              <Text style={[styles.statusText, { color: statusConf.color }]}>
                {statusConf.label}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.orderBody}>
          {firstItem && (
            <Image source={{ uri: firstItem.product.image }} style={styles.orderThumb} />
          )}
          <View style={styles.orderInfo}>
            <Text style={styles.orderItemName} numberOfLines={1}>
              {firstItem?.product.name}
              {order.items.length > 1 ? ` +${order.items.length - 1} autre(s)` : ''}
            </Text>
            <View style={styles.orderMeta}>
              <MapPin size={13} color={theme.textLight} strokeWidth={2} />
              <Text style={styles.orderAddress} numberOfLines={1}>
                {order.deliveryAddress}
              </Text>
            </View>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>
              {(order.totalAmount + order.deliveryFee).toLocaleString()} FC
            </Text>
            <ChevronRight size={18} color={theme.textLight} />
          </View>
        </View>

        {order.status === 'in_transit' && order.estimatedDelivery && (
          <View style={styles.etaBanner}>
            <Clock size={14} color={theme.accent} strokeWidth={2} />
            <Text style={styles.etaText}>Livraison estimée : {order.estimatedDelivery}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
            En cours ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
            Historique ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {displayOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            {tab === 'active' ? (
              <Package size={40} color={theme.textLight} strokeWidth={1.5} />
            ) : (
              <ClipboardList size={40} color={theme.textLight} strokeWidth={1.5} />
            )}
          </View>
          <Text style={styles.emptyTitle}>
            {tab === 'active' ? 'Aucune commande en cours' : 'Aucun historique'}
          </Text>
          <Text style={styles.emptyText}>
            {tab === 'active'
              ? 'Vos commandes actives apparaîtront ici'
              : 'Vos commandes passées apparaîtront ici'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {displayOrders.map(renderOrder)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  tabBtnActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.textSecondary,
  },
  tabTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  orderHeader: {
    marginBottom: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  orderDate: {
    fontSize: 12,
    color: theme.textLight,
  },
  orderBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: theme.divider,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderAddress: {
    fontSize: 12,
    color: theme.textSecondary,
    flex: 1,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: theme.primary,
  },
  etaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.accentLight,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  etaText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: theme.accent,
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
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
