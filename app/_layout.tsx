import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { OrdersProvider } from "@/providers/OrdersProvider";
import { PaymentProvider } from "@/providers/PaymentProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { AddressesProvider } from "@/providers/AddressesProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { theme } from "@/constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="role-select" />
      <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="otp" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="gps-permission" />
      <Stack.Screen name="(client-tabs)" />
      <Stack.Screen name="(driver-tabs)" />
      <Stack.Screen name="addresses" options={{ headerShown: true, title: 'Mes adresses' }} />
      <Stack.Screen name="edit-address" options={{ headerShown: true, title: 'Adresse' }} />
      <Stack.Screen name="payment-methods" options={{ headerShown: true, title: 'Moyens de paiement' }} />
      <Stack.Screen name="transactions" options={{ headerShown: true, title: 'Historique de paiement' }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: 'Paramètres' }} />
      <Stack.Screen name="help" options={{ headerShown: true, title: 'Aide & Support' }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: true, title: 'Mon profil' }} />
      <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Page introuvable' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const safety = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1500);
    return () => clearTimeout(safety);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.bg }}>
          <SettingsProvider>
            <AuthProvider>
              <LocationProvider>
                <AddressesProvider>
                  <NotificationsProvider>
                    <CartProvider>
                      <OrdersProvider>
                        <PaymentProvider>
                          <RootLayoutNav />
                        </PaymentProvider>
                      </OrdersProvider>
                    </CartProvider>
                  </NotificationsProvider>
                </AddressesProvider>
              </LocationProvider>
            </AuthProvider>
          </SettingsProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
