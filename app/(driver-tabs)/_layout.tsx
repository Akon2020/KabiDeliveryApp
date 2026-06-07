import { Tabs, useRouter } from 'expo-router';
import { LayoutDashboard, Wallet, User } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';

export default function DriverTabLayout() {
  const router = useRouter();
  const { activeMissions, pendingMissions } = useOrders();
  const dashboardBadge = activeMissions.length + pendingMissions.length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textLight,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.divider,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} strokeWidth={1.8} />,
          tabBarBadge: dashboardBadge > 0 ? dashboardBadge : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.accent, color: '#FFF' },
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace('/(driver-tabs)/dashboard' as any);
          },
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Revenus',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="driver-profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
