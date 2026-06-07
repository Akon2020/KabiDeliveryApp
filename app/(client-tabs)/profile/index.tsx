import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, CreditCard, CircleHelp, LogOut, ChevronRight, Settings, Pencil, Receipt } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const MENU_ITEMS = [
  { id: 'addresses', label: 'Mes adresses', icon: MapPin, color: theme.primary, route: '/addresses' },
  { id: 'payment-methods', label: 'Moyens de paiement', icon: CreditCard, color: theme.accent, route: '/payment-methods' },
  { id: 'transactions', label: 'Historique de paiement', icon: Receipt, color: '#0EA5E9', route: '/transactions' },
  { id: 'settings', label: 'Paramètres', icon: Settings, color: theme.textSecondary, route: '/settings' },
  { id: 'help', label: 'Aide & Support', icon: CircleHelp, color: '#7C3AED', route: '/help' },
];

export default function ClientProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, profilePhoto } = useAuth();

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            logout.mutate();
            router.replace('/role-select' as any);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Profil</Text>

        <TouchableOpacity
          style={styles.userCard}
          onPress={() => router.push('/edit-profile' as any)}
          activeOpacity={0.85}
          testID="edit-profile"
        >
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Utilisateur'}</Text>
            <Text style={styles.userPhone}>{user?.phone ?? ''}</Text>
          </View>
          <View style={styles.editBadge}>
            <Pencil size={14} color={theme.primary} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, index < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
              onPress={() => router.push(item.route as any)}
              testID={`menu-${item.id}`}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}14` }]}>
                <item.icon size={20} color={item.color} strokeWidth={1.8} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={theme.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
          testID="logout-button"
        >
          <LogOut size={20} color={theme.error} strokeWidth={1.8} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Kabi v1.0.0</Text>
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
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.text,
  },
  userPhone: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  editBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: theme.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.errorLight,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: theme.textLight,
  },
});
