import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Order, Mission, OrderStatus } from '@/types';
import {
  MOCK_ORDERS,
  MOCK_MISSIONS,
  COMPLETED_MISSIONS,
  generateOrderTimeline,
} from '@/mocks/orders';
import { useNotifications } from '@/providers/NotificationsProvider';

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'pickup_ready',
  'in_transit',
  'delivered',
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Commande confirmée',
  preparing: 'En préparation',
  pickup_ready: 'Prête à récupérer',
  in_transit: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STEP_DELAY_MS = 10_000;

function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export const [OrdersProvider, useOrders] = createContextHook(() => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [completedMissions, setCompletedMissions] = useState<Mission[]>(COMPLETED_MISSIONS);

  const { notify } = useNotifications();
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const missionTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      Object.values(missionTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const initialMockedRef = useRef<boolean>(false);
  useEffect(() => {
    if (initialMockedRef.current) return;
    initialMockedRef.current = true;
    MOCK_ORDERS.forEach((o) => {
      if (o.status !== 'delivered' && o.status !== 'cancelled') {
        const idx = STATUS_FLOW.indexOf(o.status);
        if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
          const upcoming = STATUS_FLOW[idx + 1];
          timersRef.current[o.id] = setTimeout(() => {
            delete timersRef.current[o.id];
            setOrders((prev) =>
              prev.map((p) =>
                p.id === o.id
                  ? { ...p, status: upcoming, timeline: generateOrderTimeline(upcoming) }
                  : p,
              ),
            );
          }, STEP_DELAY_MS);
        }
      }
    });
  }, []);

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      console.log('[Orders] Updating order status:', orderId, status);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status, timeline: generateOrderTimeline(status) }
            : o,
        ),
      );
      notify(
        `Commande ${orderId}`,
        STATUS_LABEL[status] ?? status,
        { orderId, status },
      ).catch(() => {});
    },
    [notify],
  );

  const scheduleNextProgress = useCallback(
    (orderId: string, fromStatus: OrderStatus) => {
      const upcoming = nextStatus(fromStatus);
      if (!upcoming) return;
      if (timersRef.current[orderId]) clearTimeout(timersRef.current[orderId]);

      timersRef.current[orderId] = setTimeout(() => {
        delete timersRef.current[orderId];
        let stillExists = false;
        let wasCancelled = false;
        setOrders((prev) => {
          const order = prev.find((o) => o.id === orderId);
          if (!order) return prev;
          stillExists = true;
          if (order.status === 'cancelled' || order.status === 'delivered') {
            wasCancelled = true;
            return prev;
          }
          return prev.map((o) =>
            o.id === orderId
              ? { ...o, status: upcoming, timeline: generateOrderTimeline(upcoming) }
              : o,
          );
        });
        if (stillExists && !wasCancelled) {
          notify(
            `Commande ${orderId}`,
            STATUS_LABEL[upcoming],
            { orderId, status: upcoming },
          ).catch(() => {});
          scheduleNextProgress(orderId, upcoming);
        }
      }, STEP_DELAY_MS);
    },
    [notify],
  );

  const addOrder = useCallback(
    (order: Order) => {
      console.log('[Orders] Adding order:', order.id);
      setOrders((prev) => [order, ...prev]);
      if (order.status !== 'delivered' && order.status !== 'cancelled') {
        scheduleNextProgress(order.id, order.status);
      }
    },
    [scheduleNextProgress],
  );

  const cancelOrder = useCallback(
    (orderId: string): boolean => {
      let cancelled = false;
      setOrders((prev) => {
        const order = prev.find((o) => o.id === orderId);
        if (!order) return prev;
        if (order.status !== 'pending' && order.status !== 'confirmed') {
          console.log('[Orders] Cannot cancel: status is', order.status);
          return prev;
        }
        cancelled = true;
        return prev.map((o) =>
          o.id === orderId
            ? { ...o, status: 'cancelled' as const, timeline: generateOrderTimeline('cancelled') }
            : o,
        );
      });
      if (cancelled) {
        if (timersRef.current[orderId]) {
          clearTimeout(timersRef.current[orderId]);
          delete timersRef.current[orderId];
        }
        notify(`Commande ${orderId}`, 'Annulée', { orderId }).catch(() => {});
      }
      return cancelled;
    },
    [notify],
  );

  const acceptMission = useCallback((missionId: string) => {
    console.log('[Orders] Accepting mission:', missionId);
    if (missionTimersRef.current[missionId]) {
      clearTimeout(missionTimersRef.current[missionId]);
      delete missionTimersRef.current[missionId];
    }
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, status: 'accepted' as const } : m)),
    );
  }, []);

  const rejectMission = useCallback((missionId: string) => {
    console.log('[Orders] Rejecting mission:', missionId);
    if (missionTimersRef.current[missionId]) {
      clearTimeout(missionTimersRef.current[missionId]);
      delete missionTimersRef.current[missionId];
    }
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
  }, []);

  const scheduleMissionExpiry = useCallback(
    (missionId: string, timeoutMs: number = 15_000) => {
      if (missionTimersRef.current[missionId]) {
        clearTimeout(missionTimersRef.current[missionId]);
      }
      missionTimersRef.current[missionId] = setTimeout(() => {
        delete missionTimersRef.current[missionId];
        setMissions((prev) => {
          const m = prev.find((mm) => mm.id === missionId);
          if (!m || m.status !== 'pending') return prev;
          console.log('[Orders] Mission auto-rejected after timeout:', missionId);
          return prev.filter((mm) => mm.id !== missionId);
        });
      }, timeoutMs);
    },
    [],
  );

  const updateMissionStatus = useCallback(
    (missionId: string, status: Mission['status']) => {
      console.log('[Orders] Updating mission status:', missionId, status);
      if (status === 'delivered') {
        setMissions((prev) => {
          const mission = prev.find((m) => m.id === missionId);
          if (mission) {
            setCompletedMissions((cm) => [{ ...mission, status: 'delivered' }, ...cm]);
          }
          return prev.filter((m) => m.id !== missionId);
        });
      } else {
        setMissions((prev) =>
          prev.map((m) => (m.id === missionId ? { ...m, status } : m)),
        );
      }
    },
    [],
  );

  const validateDeliveryPin = useCallback(
    (missionId: string, pin: string): { ok: boolean; reason?: string } => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return { ok: false, reason: 'Mission introuvable' };
      if (mission.deliveryPin !== pin.trim()) {
        return { ok: false, reason: 'Code PIN incorrect' };
      }
      updateMissionStatus(missionId, 'delivered');
      return { ok: true };
    },
    [missions, updateMissionStatus],
  );

  const pendingMissions = useMemo(
    () => missions.filter((m) => m.status === 'pending'),
    [missions],
  );

  const activeMissions = useMemo(
    () => missions.filter((m) => m.status !== 'pending'),
    [missions],
  );

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled'),
    [orders],
  );

  const pastOrders = useMemo(
    () => orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled'),
    [orders],
  );

  const totalEarnings = useMemo(
    () => completedMissions.reduce((sum, m) => sum + m.deliveryFee, 0),
    [completedMissions],
  );

  return {
    orders,
    missions,
    completedMissions,
    pendingMissions,
    activeMissions,
    activeOrders,
    pastOrders,
    totalEarnings,
    addOrder,
    updateOrderStatus,
    cancelOrder,
    acceptMission,
    rejectMission,
    updateMissionStatus,
    validateDeliveryPin,
    scheduleMissionExpiry,
  };
});
