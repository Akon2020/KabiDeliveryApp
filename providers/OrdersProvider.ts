import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Order, Mission, OrderStatus } from '@/types';
import { MOCK_ORDERS, MOCK_MISSIONS, COMPLETED_MISSIONS, generateOrderTimeline } from '@/mocks/orders';

export const [OrdersProvider, useOrders] = createContextHook(() => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [completedMissions, setCompletedMissions] = useState<Mission[]>(COMPLETED_MISSIONS);

  const addOrder = useCallback((order: Order) => {
    console.log('[Orders] Adding order:', order.id);
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    console.log('[Orders] Updating order status:', orderId, status);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, timeline: generateOrderTimeline(status) }
          : o
      )
    );
  }, []);

  const acceptMission = useCallback((missionId: string) => {
    console.log('[Orders] Accepting mission:', missionId);
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, status: 'accepted' as const } : m
      )
    );
  }, []);

  const rejectMission = useCallback((missionId: string) => {
    console.log('[Orders] Rejecting mission:', missionId);
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
  }, []);

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
          prev.map((m) => (m.id === missionId ? { ...m, status } : m))
        );
      }
    },
    []
  );

  const pendingMissions = useMemo(
    () => missions.filter((m) => m.status === 'pending'),
    [missions]
  );

  const activeMissions = useMemo(
    () => missions.filter((m) => m.status !== 'pending'),
    [missions]
  );

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled'),
    [orders]
  );

  const pastOrders = useMemo(
    () => orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled'),
    [orders]
  );

  const totalEarnings = useMemo(
    () => completedMissions.reduce((sum, m) => sum + m.deliveryFee, 0),
    [completedMissions]
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
    acceptMission,
    rejectMission,
    updateMissionStatus,
  };
});
