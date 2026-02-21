import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Payment, PaymentMethod, PaymentStatus } from '@/types';
import { createMockPayment, simulatePaymentProcessing } from '@/mocks/payments';

export const [PaymentProvider, usePayment] = createContextHook(() => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);

  const initiatePayment = useCallback(
    (orderId: string, method: PaymentMethod, amount: number, fee: number, phoneNumber?: string) => {
      console.log('[Payment] Initiating payment for order:', orderId, 'method:', method);
      const payment = createMockPayment(orderId, method, amount, fee, phoneNumber);
      setCurrentPayment(payment);
      setPayments((prev) => [payment, ...prev]);
      return payment;
    },
    []
  );

  const processPayment = useCallback(async (paymentId: string): Promise<PaymentStatus> => {
    console.log('[Payment] Processing payment:', paymentId);

    setCurrentPayment((prev) =>
      prev?.id === paymentId ? { ...prev, status: 'processing' } : prev
    );
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'processing' as const } : p))
    );

    const result = await simulatePaymentProcessing();
    const now = new Date().toISOString();
    const txRef = result === 'success' ? `TXN-${Date.now().toString().slice(-10)}` : undefined;
    const failureReason = result === 'failed' ? 'Transaction refusée par l\'opérateur. Vérifiez votre solde.' : undefined;

    setCurrentPayment((prev) =>
      prev?.id === paymentId
        ? {
            ...prev,
            status: result,
            completedAt: now,
            transactionRef: txRef,
            failureReason,
          }
        : prev
    );
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: result,
              completedAt: now,
              transactionRef: txRef,
              failureReason,
            }
          : p
      )
    );

    console.log('[Payment] Payment result:', result);
    return result;
  }, []);

  const retryPayment = useCallback(
    (orderId: string, method: PaymentMethod, amount: number, fee: number, phoneNumber?: string) => {
      console.log('[Payment] Retrying payment for order:', orderId);
      const payment = createMockPayment(orderId, method, amount, fee, phoneNumber);
      setCurrentPayment(payment);
      setPayments((prev) => [payment, ...prev]);
      return payment;
    },
    []
  );

  const getPaymentForOrder = useCallback(
    (orderId: string): Payment | undefined => {
      return payments.find((p) => p.orderId === orderId && p.status === 'success');
    },
    [payments]
  );

  const clearCurrentPayment = useCallback(() => {
    setCurrentPayment(null);
  }, []);

  const successPayments = useMemo(
    () => payments.filter((p) => p.status === 'success'),
    [payments]
  );

  return {
    payments,
    currentPayment,
    successPayments,
    initiatePayment,
    processPayment,
    retryPayment,
    getPaymentForOrder,
    clearCurrentPayment,
  };
});
