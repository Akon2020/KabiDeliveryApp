import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function DashboardLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="mission" options={{ title: 'Mission' }} />
      <Stack.Screen name="validate" options={{ title: 'Validation' }} />
    </Stack>
  );
}
