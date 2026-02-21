export type UserRole = 'client' | 'driver';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type ServiceType = 'food' | 'pharmacy' | 'shop' | 'groceries' | 'parcel';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  icon: string;
  color: string;
  bg: string;
  description: string;
}

export interface Product {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'pickup_ready'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface OrderTimeline {
  status: OrderStatus;
  label: string;
  time: string;
  completed: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  driverId?: string;
  driverName?: string;
  serviceType: ServiceType;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  clientName: string;
  clientPhone: string;
  notes?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  estimatedDelivery?: string;
  deliveryPin?: string;
}

export interface Mission {
  id: string;
  orderId: string;
  clientName: string;
  clientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  serviceType: ServiceType;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered';
  createdAt: string;
  deliveryPin: string;
}

export interface ParcelOrder {
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  description: string;
  weight: string;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'mpesa' | 'airtel' | 'orange';

export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  fee: number;
  total: number;
  status: PaymentStatus;
  phoneNumber?: string;
  transactionRef?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  iconUrl?: string;
  color: string;
  bg: string;
}
