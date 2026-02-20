import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bike, TrendingUp, Clock, Package, MapPin, Phone, X, Check, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useOrders } from '@/providers/OrdersProvider';
import { theme } from '@/constants/theme';
import { Mission } from '@/types';
import KhabiMap from '@/components/KhabiMap';
import * as Haptics from 'expo-haptics';

const SERVICE_LABELS: Record<string, string> = {
  food: 'Restaurant',
  pharmacy: 'Pharmacie',
  shop: 'Boutique',
  groceries: 'Courses',
  parcel: 'Colis',
};

export default function DriverDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { pendingMissions, activeMissions, completedMissions, acceptMission, rejectMission, totalEarnings } = useOrders();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const firstName = user?.name?.split(' ')[0] ?? 'Livreur';
  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleOnline = useCallback((value: boolean) => {
    console.log('[Dashboard] Online status:', value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOnline(value);
  }, []);

  const showMissionModal = useCallback((mission: Mission) => {
    setSelectedMission(mission);
    Animated.spring(slideAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  }, [slideAnim]);

  const hideMissionModal = useCallback(() => {
    Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setSelectedMission(null);
    });
  }, [slideAnim]);

  const handleAccept = useCallback(() => {
    if (!selectedMission) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    acceptMission(selectedMission.id);
    hideMissionModal();
  }, [selectedMission, acceptMission, hideMissionModal]);

  const handleReject = useCallback(() => {
    if (!selectedMission) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rejectMission(selectedMission.id);
    hideMissionModal();
  }, [selectedMission, rejectMission, hideMissionModal]);

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
            <Text style={styles.userName}>{firstName} 🚀</Text>
          </View>
          <View style={styles.statusToggle}>
            <Text style={[styles.statusText, isOnline ? styles.statusOnline : styles.statusOffline]}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnline}
              trackColor={{ false: theme.border, true: theme.accent + '60' }}
              thumbColor={isOnline ? theme.accent : theme.textLight}
              testID="online-toggle"
            />
          </View>
        </View>

        <View style={[styles.statusBanner, isOnline ? styles.bannerOnline : styles.bannerOffline]}>
          <Bike size={22} color={isOnline ? theme.accent : theme.textSecondary} strokeWidth={2} />
          <Text style={[styles.bannerText, isOnline ? styles.bannerTextOnline : styles.bannerTextOffline]}>
            {isOnline
              ? 'Vous êtes visible. En attente de commandes...'
              : 'Activez votre statut pour recevoir des commandes'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.accentLight }]}>
              <Package size={20} color={theme.accent} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{completedMissions.length}</Text>
            <Text style={styles.statLabel}>Courses aujourd&apos;hui</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.successLight }]}>
              <TrendingUp size={20} color={theme.success} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{totalEarnings.toLocaleString()} FC</Text>
            <Text style={styles.statLabel}>Gains du jour</Text>
          </View>
        </View>

        {isOnline && pendingMissions.length > 0 && (
          <View style={styles.pendingSection}>
            <Text style={styles.sectionTitle}>
              Nouvelles commandes ({pendingMissions.length})
            </Text>
            {pendingMissions.map((mission) => (
              <TouchableOpacity
                key={mission.id}
                style={styles.missionCard}
                activeOpacity={0.85}
                onPress={() => showMissionModal(mission)}
              >
                <View style={styles.missionHeader}>
                  <View style={styles.missionTypeBadge}>
                    <Text style={styles.missionTypeText}>
                      {SERVICE_LABELS[mission.serviceType] ?? mission.serviceType}
                    </Text>
                  </View>
                  <Text style={styles.missionFee}>{mission.deliveryFee.toLocaleString()} FC</Text>
                </View>
                <View style={styles.missionBody}>
                  <View style={styles.missionRoute}>
                    <View style={styles.routeRow}>
                      <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
                      <Text style={styles.routeText} numberOfLines={1}>{mission.pickupAddress}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routeRow}>
                      <View style={[styles.routeDot, { backgroundColor: theme.accent }]} />
                      <Text style={styles.routeText} numberOfLines={1}>{mission.deliveryAddress}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.missionFooter}>
                  <Text style={styles.missionClient}>{mission.clientName}</Text>
                  <ChevronRight size={18} color={theme.textLight} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeMissions.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>Missions actives ({activeMissions.length})</Text>
            {activeMissions.map((mission) => (
              <TouchableOpacity
                key={mission.id}
                style={[styles.missionCard, styles.activeMissionCard]}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/(driver-tabs)/dashboard/mission' as any,
                    params: { missionId: mission.id },
                  })
                }
              >
                <View style={styles.missionHeader}>
                  <View style={[styles.missionTypeBadge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.missionTypeText, { color: theme.primary }]}>
                      {SERVICE_LABELS[mission.serviceType] ?? mission.serviceType}
                    </Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>En cours</Text>
                  </View>
                </View>
                <View style={styles.missionBody}>
                  <Text style={styles.activeMissionClient}>{mission.clientName}</Text>
                  <Text style={styles.activeMissionAddress} numberOfLines={1}>
                    → {mission.deliveryAddress}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Votre position</Text>
          <KhabiMap height={200} />
        </View>

        {!isOnline && pendingMissions.length === 0 && activeMissions.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Clock size={32} color={theme.textLight} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptyText}>
              Passez en ligne pour recevoir des commandes
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedMission} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [400, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {selectedMission && (
              <>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Nouvelle mission</Text>
                  <TouchableOpacity onPress={hideMissionModal}>
                    <X size={24} color={theme.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalFeeCard}>
                  <Text style={styles.modalFeeLabel}>Frais de livraison</Text>
                  <Text style={styles.modalFeeValue}>
                    {selectedMission.deliveryFee.toLocaleString()} FC
                  </Text>
                </View>

                <View style={styles.modalRoute}>
                  <View style={styles.routeRow}>
                    <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeLabel}>Retrait</Text>
                      <Text style={styles.routeAddress}>{selectedMission.pickupAddress}</Text>
                    </View>
                  </View>
                  <View style={styles.routeLineModal} />
                  <View style={styles.routeRow}>
                    <View style={[styles.routeDot, { backgroundColor: theme.accent }]} />
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeLabel}>Livraison</Text>
                      <Text style={styles.routeAddress}>{selectedMission.deliveryAddress}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalClientRow}>
                  <View style={styles.modalClientAvatar}>
                    <Text style={styles.modalClientAvatarText}>
                      {selectedMission.clientName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.modalClientInfo}>
                    <Text style={styles.modalClientName}>{selectedMission.clientName}</Text>
                    <Text style={styles.modalClientPhone}>{selectedMission.clientPhone}</Text>
                  </View>
                </View>

                <View style={styles.modalItems}>
                  <Text style={styles.modalItemsLabel}>
                    {selectedMission.items.reduce((s, i) => s + i.quantity, 0)} article(s) •{' '}
                    {selectedMission.totalAmount.toLocaleString()} FC
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={handleReject}
                    activeOpacity={0.85}
                  >
                    <X size={20} color={theme.error} strokeWidth={2.5} />
                    <Text style={styles.rejectButtonText}>Refuser</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={handleAccept}
                    activeOpacity={0.85}
                  >
                    <Check size={20} color="#FFF" strokeWidth={2.5} />
                    <Text style={styles.acceptButtonText}>Accepter</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
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
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  statusOnline: {
    color: theme.accent,
  },
  statusOffline: {
    color: theme.textSecondary,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  bannerOnline: {
    backgroundColor: theme.accentLight,
  },
  bannerOffline: {
    backgroundColor: theme.divider,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  bannerTextOnline: {
    color: theme.accent,
  },
  bannerTextOffline: {
    color: theme.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
  pendingSection: {
    marginBottom: 24,
  },
  activeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 14,
  },
  missionCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  activeMissionCard: {
    borderLeftColor: theme.primary,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  missionTypeBadge: {
    backgroundColor: theme.accentLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  missionTypeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.accent,
  },
  missionFee: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: theme.accent,
  },
  missionBody: {
    marginBottom: 10,
  },
  missionRoute: {},
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeText: {
    flex: 1,
    fontSize: 13,
    color: theme.text,
  },
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: theme.divider,
    marginLeft: 4,
    marginVertical: 2,
  },
  missionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.divider,
    paddingTop: 10,
  },
  missionClient: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.textSecondary,
  },
  activeBadge: {
    backgroundColor: theme.successLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.success,
  },
  activeMissionClient: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 4,
  },
  activeMissionAddress: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  mapSection: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: theme.surface,
    borderRadius: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.divider,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.text,
  },
  modalFeeCard: {
    backgroundColor: theme.accentLight,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalFeeLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  modalFeeValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: theme.accent,
  },
  modalRoute: {
    marginBottom: 20,
  },
  routeLineModal: {
    width: 2,
    height: 20,
    backgroundColor: theme.divider,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeInfo: {
    flex: 1,
    marginLeft: 2,
  },
  routeLabel: {
    fontSize: 11,
    color: theme.textLight,
    fontWeight: '500' as const,
  },
  routeAddress: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500' as const,
  },
  modalClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  modalClientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClientAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.primary,
  },
  modalClientInfo: {
    marginLeft: 12,
  },
  modalClientName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
  },
  modalClientPhone: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  modalItems: {
    marginBottom: 24,
  },
  modalItemsLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.errorLight,
    borderRadius: 16,
    paddingVertical: 16,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.error,
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
});
