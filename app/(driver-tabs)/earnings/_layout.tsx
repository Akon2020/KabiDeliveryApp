import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function EarningsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Mes revenus',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        }}
      />
    </Stack>
  );
}
