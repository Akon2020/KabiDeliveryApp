import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Mes commandes' }}
      />
      <Stack.Screen
        name="[orderId]"
        options={{ title: 'Détail commande' }}
      />
    </Stack>
  );
}
