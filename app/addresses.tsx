import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import {
  MapPin,
  Home,
  Briefcase,
  Plus,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAddresses, Address, AddressKind } from '@/providers/AddressesProvider';

function kindIcon(kind: AddressKind) {
  if (kind === 'home') return Home;
  if (kind === 'work') return Briefcase;
  return MapPin;
}

export default function AddressesScreen() {
  const { addresses, removeAddress, setDefault } = useAddresses();

  const handleEdit = useCallback((id: string) => {
    router.push(`/edit-address?id=${id}` as any);
  }, []);

  const handleAdd = useCallback(() => {
    router.push('/edit-address' as any);
  }, []);

  const handleLongPress = useCallback(
    (addr: Address) => {
      const actions: { text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }[] = [
        { text: 'Annuler', style: 'cancel' },
      ];
      if (!addr.isDefault) {
        actions.push({
          text: 'Définir par défaut',
          onPress: () => setDefault(addr.id),
        });
      }
      actions.push({
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Supprimer l\'adresse',
            `Voulez-vous vraiment supprimer "${addr.label}" ?`,
            [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Supprimer',
                style: 'destructive',
                onPress: () => removeAddress(addr.id),
              },
            ],
          );
        },
      });
      Alert.alert(addr.label, addr.fullAddress, actions);
    },
    [removeAddress, setDefault],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mes adresses' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <MapPin size={40} color={theme.textLight} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Aucune adresse</Text>
            <Text style={styles.emptyDescription}>
              Ajoutez une adresse pour faciliter vos commandes
            </Text>
          </View>
        ) : (
          addresses.map((addr) => {
            const Icon = kindIcon(addr.kind);
            return (
              <TouchableOpacity
                key={addr.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => handleEdit(addr.id)}
                onLongPress={() => handleLongPress(addr)}
                testID={`address-${addr.id}`}
              >
                <View style={styles.cardIcon}>
                  <Icon size={20} color={theme.primary} strokeWidth={2} />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>{addr.label}</Text>
                    {addr.isDefault ? (
                      <View style={styles.badge}>
                        <Star size={10} color={theme.primary} strokeWidth={2} fill={theme.primary} />
                        <Text style={styles.badgeText}>Par défaut</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.cardAddress} numberOfLines={2}>
                    {addr.fullAddress}
                  </Text>
                  {addr.details ? (
                    <Text style={styles.cardDetails} numberOfLines={1}>
                      {addr.details}
                    </Text>
                  ) : null}
                </View>
                <ChevronRight size={18} color={theme.textLight} strokeWidth={2} />
              </TouchableOpacity>
            );
          })
        )}

        {addresses.length > 0 ? (
          <Text style={styles.hint}>
            Appui long sur une adresse pour la définir par défaut ou la supprimer.
          </Text>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={handleAdd}
        testID="add-address-fab"
      >
        <Plus size={26} color="#FFF" strokeWidth={2.5} />
      </TouchableOpacity>
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
    paddingBottom: 120,
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
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: theme.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  cardAddress: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  cardDetails: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: theme.textLight,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
    lineHeight: 18,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
