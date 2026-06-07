import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Receipt, CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { usePayment } from '@/providers/PaymentProvider';
import { PAYMENT_METHODS } from '@/mocks/payments';
import { Payment, PaymentMethod } from '@/types';

function methodOption(id: PaymentMethod) {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function TransactionsScreen() {
  const { successPayments } = usePayment();

  const sorted = useMemo<Payment[]>(() => {
    return [...successPayments].sort((a, b) => {
      const ad = a.completedAt ?? a.createdAt;
      const bd = b.completedAt ?? b.createdAt;
      return new Date(bd).getTime() - new Date(ad).getTime();
    });
  }, [successPayments]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Historique de paiement' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Receipt size={40} color={theme.textLight} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Aucune transaction</Text>
            <Text style={styles.emptyDescription}>
              Vos paiements réussis apparaîtront ici
            </Text>
          </View>
        ) : (
          sorted.map((p) => {
            const opt = methodOption(p.method);
            const dateStr = formatDate(p.completedAt ?? p.createdAt);
            return (
              <View key={p.id} style={styles.card}>
                <View style={[styles.logoWrap, { backgroundColor: opt?.bg ?? theme.divider }]}>
                  {opt?.iconUrl ? (
                    <Image
                      source={{ uri: opt.iconUrl }}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={[styles.logoEmoji]}>{opt?.icon ?? ''}</Text>
                  )}
                </View>
                <View style={styles.body}>
                  <View style={styles.rowTop}>
                    <Text style={styles.method}>{opt?.label ?? p.method}</Text>
                    <Text style={styles.amount}>{p.total.toLocaleString()} FC</Text>
                  </View>
                  <Text style={styles.date}>{dateStr}</Text>
                  <View style={styles.rowBottom}>
                    <View style={styles.statusRow}>
                      <CheckCircle2 size={12} color={theme.success} strokeWidth={2} />
                      <Text style={styles.statusText}>Réussi</Text>
                    </View>
                    {p.transactionRef ? (
                      <Text style={styles.txRef} numberOfLines={1}>
                        {p.transactionRef}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })
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
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoEmoji: {
    fontSize: 22,
  },
  body: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  method: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: theme.text,
    flexShrink: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginLeft: 8,
  },
  date: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 6,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: theme.success,
  },
  txRef: {
    fontSize: 11,
    color: theme.textLight,
    flexShrink: 1,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
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
    paddingHorizontal: 24,
  },
});
