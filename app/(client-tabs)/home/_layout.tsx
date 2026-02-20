import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function HomeLayout() {
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
      <Stack.Screen name="catalogue" options={{ title: 'Catalogue' }} />
      <Stack.Screen name="product" options={{ title: 'Produit' }} />
      <Stack.Screen name="cart" options={{ title: 'Mon panier' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="create-parcel" options={{ title: 'Envoyer un colis' }} />
      <Stack.Screen name="order-recap" options={{ title: 'Récapitulatif', headerBackVisible: false }} />
    </Stack>
  );
}
