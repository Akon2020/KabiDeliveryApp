import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, FileText, Star, Settings, CircleHelp, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useOrders } from '@/providers/OrdersProvider';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const MENU_ITEMS = [
  { id: 'docs', label: 'Mes documents', icon: FileText, color: theme.accent, route: null },
  { id: 'ratings', label: 'Évaluations', icon: Star, color: '#FBBF24', route: null },
  { id: 'settings', label: 'Paramètres', icon: Settings, color: theme.textSecondary, route: '/settings' },
  { id: 'help', label: 'Aide & Support', icon: CircleHelp, color: '#7C3AED', route: '/help' },
];

export default function DriverProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { completedMissions } = useOrders();

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

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? 'L'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Livreur'}</Text>
            <Text style={styles.userPhone}>{user?.phone ?? ''}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Livreur</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{completedMissions.length}</Text>
            <Text style={styles.miniStatLabel}>Courses</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>4.8</Text>
            <Text style={styles.miniStatLabel}>Note</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{completedMissions.length > 0 ? '3' : '0'}</Text>
            <Text style={styles.miniStatLabel}>Jours actifs</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, index < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
              onPress={() => {
                if (item.route) router.push(item.route as any);
              }}
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
    marginBottom: 16,
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
    backgroundColor: theme.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.accent,
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
  roleBadge: {
    backgroundColor: theme.accentLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.accent,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
  miniStatDivider: {
    width: 1,
    backgroundColor: theme.divider,
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
