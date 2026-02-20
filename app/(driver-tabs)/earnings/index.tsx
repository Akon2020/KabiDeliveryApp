import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Wallet, TrendingUp, Calendar, Package, Clock } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';

const SERVICE_LABELS: Record<string, string> = {
  food: 'Restaurant',
  pharmacy: 'Pharmacie',
  shop: 'Boutique',
  groceries: 'Courses',
  parcel: 'Colis',
};

export default function EarningsScreen() {
  const { completedMissions, totalEarnings } = useOrders();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total ce mois</Text>
          <Text style={styles.totalAmount}>{totalEarnings.toLocaleString()} FC</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalStat}>
              <Calendar size={16} color={theme.textSecondary} strokeWidth={2} />
              <Text style={styles.totalStatText}>{completedMissions.length} courses</Text>
            </View>
            <View style={styles.totalStat}>
              <TrendingUp size={16} color={theme.success} strokeWidth={2} />
              <Text style={[styles.totalStatText, { color: theme.success }]}>
                {completedMissions.length > 0 ? '+12%' : '+0%'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historique des livraisons</Text>

        {completedMissions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Wallet size={40} color={theme.textLight} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Aucun revenu</Text>
            <Text style={styles.emptyDescription}>
              Complétez des livraisons pour voir vos gains ici
            </Text>
          </View>
        ) : (
          completedMissions.map((mission) => (
            <View key={mission.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                  <Package size={18} color={theme.accent} strokeWidth={2} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyClient}>{mission.clientName}</Text>
                  <Text style={styles.historyType}>
                    {SERVICE_LABELS[mission.serviceType] ?? mission.serviceType}
                  </Text>
                  <View style={styles.historyMeta}>
                    <Clock size={12} color={theme.textLight} strokeWidth={2} />
                    <Text style={styles.historyDate}>
                      {new Date(mission.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyFee}>+{mission.deliveryFee.toLocaleString()} FC</Text>
                <Text style={styles.historyTotal}>{mission.totalAmount.toLocaleString()} FC cmd</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    paddingBottom: 24,
  },
  totalCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: theme.text,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    gap: 20,
  },
  totalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalStatText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  iconCircle: {
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
  emptyDescription: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  historyClient: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 2,
  },
  historyType: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyDate: {
    fontSize: 11,
    color: theme.textLight,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyFee: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.success,
    marginBottom: 2,
  },
  historyTotal: {
    fontSize: 11,
    color: theme.textLight,
  },
});
