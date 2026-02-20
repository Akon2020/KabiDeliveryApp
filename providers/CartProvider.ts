import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CartItem, Product } from '@/types';

const CART_STORAGE_KEY = 'khabi_cart';
const SERVICE_STORAGE_KEY = 'khabi_cart_service';

interface PersistedCart {
  items: CartItem[];
  activeServiceId: string | null;
}

export const [CartProvider, useCart] = createContextHook(() => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const cartQuery = useQuery({
    queryKey: ['cart-persisted'],
    queryFn: async (): Promise<PersistedCart> => {
      console.log('[Cart] Loading persisted cart...');
      const [cartData, serviceData] = await Promise.all([
        AsyncStorage.getItem(CART_STORAGE_KEY),
        AsyncStorage.getItem(SERVICE_STORAGE_KEY),
      ]);
      const parsedItems = cartData ? (JSON.parse(cartData) as CartItem[]) : [];
      const parsedService = serviceData ?? null;
      console.log('[Cart] Loaded', parsedItems.length, 'items');
      return { items: parsedItems, activeServiceId: parsedService };
    },
  });

  useEffect(() => {
    if (cartQuery.data && !isHydrated) {
      setItems(cartQuery.data.items);
      setActiveServiceId(cartQuery.data.activeServiceId);
      setIsHydrated(true);
    }
  }, [cartQuery.data, isHydrated]);

  const persistCart = useMutation({
    mutationFn: async (data: PersistedCart) => {
      await Promise.all([
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data.items)),
        data.activeServiceId
          ? AsyncStorage.setItem(SERVICE_STORAGE_KEY, data.activeServiceId)
          : AsyncStorage.removeItem(SERVICE_STORAGE_KEY),
      ]);
    },
  });

  const syncPersist = useCallback((newItems: CartItem[], newServiceId: string | null) => {
    persistCart.mutate({ items: newItems, activeServiceId: newServiceId });
  }, [persistCart]);

  const addItem = useCallback((product: Product) => {
    console.log('[Cart] Adding item:', product.name);
    setItems((prev) => {
      let newServiceId = activeServiceId;
      let base = prev;

      if (activeServiceId && activeServiceId !== product.serviceId) {
        console.log('[Cart] Clearing cart for new service');
        newServiceId = product.serviceId;
        setActiveServiceId(newServiceId);
        const result = [{ product, quantity: 1 }];
        syncPersist(result, newServiceId);
        return result;
      }
      if (!activeServiceId) {
        newServiceId = product.serviceId;
        setActiveServiceId(newServiceId);
      }
      const existing = base.find((i) => i.product.id === product.id);
      let result: CartItem[];
      if (existing) {
        result = base.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        result = [...base, { product, quantity: 1 }];
      }
      syncPersist(result, newServiceId);
      return result;
    });
  }, [activeServiceId, syncPersist]);

  const removeItem = useCallback((productId: string) => {
    console.log('[Cart] Removing item:', productId);
    setItems((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      if (updated.length === 0) {
        setActiveServiceId(null);
        syncPersist([], null);
      } else {
        syncPersist(updated, activeServiceId);
      }
      return updated;
    });
  }, [activeServiceId, syncPersist]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
      syncPersist(updated, activeServiceId);
      return updated;
    });
  }, [removeItem, activeServiceId, syncPersist]);

  const clearCart = useCallback(() => {
    console.log('[Cart] Clearing cart');
    setItems([]);
    setActiveServiceId(null);
    syncPersist([], null);
  }, [syncPersist]);

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    return totalAmount > 15000 ? 1500 : 2000;
  }, [items.length, totalAmount]);

  return {
    items,
    activeServiceId,
    totalAmount,
    totalItems,
    deliveryFee,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
});
