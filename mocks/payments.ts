import { Payment, PaymentMethodOption } from '@/types';
import { theme } from '@/constants/theme';

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'mpesa',
    label: 'M-Pesa',
    description: 'Vodacom M-Pesa',
    icon: '',
    iconUrl: 'https://play-lh.googleusercontent.com/XOIgIGCECTxynIY-kShXrVQkIZ7YWHDaui3jAoD24RyZk6faKjp7XV6FSOR0BgdTgO8',
    color: '#E60000',
    bg: '#FEE2E2',
  },
  {
    id: 'airtel',
    label: 'Airtel Money',
    description: 'Airtel Money RDC',
    icon: '',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Airtel_logo-01.png/960px-Airtel_logo-01.png',
    color: '#FF2D00',
    bg: '#FFF0E6',
  },
  {
    id: 'orange',
    label: 'Orange Money',
    description: 'Orange Money RDC',
    icon: '',
    iconUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_vfRbApK454_NJJitH8Cjm4tm6FcBHbYQdA&s',
    color: '#FF6600',
    bg: '#FFF4E6',
  },
  {
    id: 'cash',
    label: 'Cash à la livraison',
    description: 'Payer en espèces au livreur',
    icon: '💵',
    color: theme.success,
    bg: theme.successLight,
  },
];

export function createMockPayment(
  orderId: string,
  method: Payment['method'],
  amount: number,
  fee: number,
  phoneNumber?: string,
): Payment {
  return {
    id: `PAY-${Date.now().toString().slice(-8)}`,
    orderId,
    method,
    amount,
    fee,
    total: amount + fee,
    status: 'pending',
    phoneNumber,
    createdAt: new Date().toISOString(),
  };
}

export function simulatePaymentProcessing(): Promise<'success' | 'failed'> {
  return new Promise((resolve) => {
    const delay = 3000 + Math.random() * 4000;
    setTimeout(() => {
      const success = Math.random() > 0.15;
      resolve(success ? 'success' : 'failed');
    }, delay);
  });
}
