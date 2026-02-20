import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { MapPin, Phone, Package, Navigation, CheckCircle, ArrowRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { Mission } from '@/types';
import KhabiMap from '@/components/KhabiMap';
import * as Haptics from 'expo-haptics';

const STATUS_STEPS: { key: Mission['status']; label: string }[] = [
  { key: 'accepted', label: 'Mission acceptée' },
  { key: 'picked_up', label: 'Colis récupéré' },
  { key: 'in_transit', label: 'En route' },
  { key: 'delivered', label: 'Livré' },
];

export default function MissionDetailScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const { missions, updateMissionStatus } = useOrders();

  const mission = missions.find((m) => m.id === missionId);

  const handleNextStep = useCallback(() => {
    if (!mission) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const currentIndex = STATUS_STEPS.findIndex((s) => s.key === mission.status);
    const nextStep = STATUS_STEPS[currentIndex + 1];

    if (!nextStep) return;

    if (nextStep.key === 'delivered') {
      router.push({
        pathname: '/(driver-tabs)/dashboard/validate' as any,
        params: { missionId: mission.id },
      });
      return;
    }

    updateMissionStatus(mission.id, nextStep.key);
  }, [mission, updateMissionStatus]);

  if (!mission) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Mission' }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Mission introuvable</Text>
        </View>
      </View>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === mission.status);
  const nextStep = STATUS_STEPS[currentStepIndex + 1];

  const getButtonLabel = () => {
    if (!nextStep) return 'Mission terminée';
    switch (nextStep.key) {
      case 'picked_up': return 'Confirmer le retrait';
      case 'in_transit': return 'Démarrer la livraison';
      case 'delivered': return 'Valider la livraison';
      default: return 'Étape suivante';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Mission ${mission.id}` }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapSection}>
          <KhabiMap height={200} />
        </View>

        <View style={styles.stepsCard}>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isLast = index === STATUS_STEPS.length - 1;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted ? styles.stepDotDone : styles.stepDotPending,
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    {isCompleted && <CheckCircle size={14} color="#FFF" strokeWidth={2.5} />}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        isCompleted ? styles.stepLineDone : styles.stepLinePending,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelDone,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Retrait</Text>
              <Text style={styles.routeAddress}>{mission.pickupAddress}</Text>
            </View>
            <TouchableOpacity style={styles.navButton}>
              <Navigation size={18} color={theme.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.routeSep} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: theme.accent }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Livraison</Text>
              <Text style={styles.routeAddress}>{mission.deliveryAddress}</Text>
            </View>
            <TouchableOpacity style={styles.navButton}>
              <Navigation size={18} color={theme.accent} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.clientCard}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarText}>
              {mission.clientName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{mission.clientName}</Text>
            <Text style={styles.clientPhone}>{mission.clientPhone}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Phone size={20} color={theme.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Articles</Text>
          {mission.items.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                {(item.product.price * item.quantity).toLocaleString()} FC
              </Text>
            </View>
          ))}
          <View style={styles.sep} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total commande</Text>
            <Text style={styles.totalValue}>{mission.totalAmount.toLocaleString()} FC</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.feeLabel}>Vos gains</Text>
            <Text style={styles.feeValue}>{mission.deliveryFee.toLocaleString()} FC</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {nextStep && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextStep}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>{getButtonLabel()}</Text>
            <ArrowRight size={20} color="#FFF" strokeWidth={2.5} />
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
  stepsCard: {
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  stepLeft: {
    width: 30,
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: theme.primary,
  },
  stepDotPending: {
    backgroundColor: theme.divider,
  },
  stepDotCurrent: {
    backgroundColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  stepLineDone: {
    backgroundColor: theme.primary,
  },
  stepLinePending: {
    backgroundColor: theme.divider,
  },
  stepLabel: {
    fontSize: 14,
    color: theme.textLight,
    fontWeight: '500' as const,
    marginLeft: 12,
    marginTop: 2,
  },
  stepLabelDone: {
    color: theme.text,
    fontWeight: '600' as const,
  },
  stepLabelCurrent: {
    color: theme.accent,
    fontWeight: '700' as const,
  },
  routeCard: {
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: theme.textLight,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.text,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeSep: {
    height: 1,
    backgroundColor: theme.divider,
    marginVertical: 14,
    marginLeft: 24,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.primary,
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.text,
  },
  clientPhone: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsCard: {
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 14,
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
  sep: {
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
  totalValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
  },
  feeLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: theme.text,
  },
  feeValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: theme.accent,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: theme.bg,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
});
