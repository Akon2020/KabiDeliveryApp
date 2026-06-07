import { Tabs, useRouter } from 'expo-router';
import { Home, ClipboardList, User } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';

export default function ClientTabLayout() {
  const router = useRouter();
  const { activeOrders } = useOrders();
  const activeCount = activeOrders.length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
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
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.8} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace('/(client-tabs)/home' as any);
          },
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} strokeWidth={1.8} />,
          tabBarBadge: activeCount > 0 ? activeCount : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.accent, color: '#FFF' },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
