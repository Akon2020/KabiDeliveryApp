import { Order, Mission, OrderTimeline, OrderStatus } from '@/types';

export function generateOrderTimeline(currentStatus: OrderStatus): OrderTimeline[] {
  const statuses: { status: OrderStatus; label: string }[] = [
    { status: 'pending', label: 'Commande passée' },
    { status: 'confirmed', label: 'Confirmée' },
    { status: 'preparing', label: 'En préparation' },
    { status: 'pickup_ready', label: 'Prête à récupérer' },
    { status: 'in_transit', label: 'En livraison' },
    { status: 'delivered', label: 'Livrée' },
  ];

  const currentIndex = statuses.findIndex((s) => s.status === currentStatus);
  const now = new Date();

  return statuses.map((s, i) => ({
    status: s.status,
    label: s.label,
    time: i <= currentIndex
      ? new Date(now.getTime() - (currentIndex - i) * 5 * 60000).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--',
    completed: i <= currentIndex,
  }));
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    clientId: 'client-001',
    driverId: 'driver-001',
    driverName: 'Isaac Uriel',
    serviceType: 'food',
    items: [
      {
        product: {
          id: 'f1',
          serviceId: 'food',
          name: 'Poulet Moambé',
          description: 'Poulet braisé sauce moambé',
          price: 8500,
          image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
          category: 'Plats congolais',
          available: true,
        },
        quantity: 2,
      },
      {
        product: {
          id: 'f3',
          serviceId: 'food',
          name: 'Pondu & Fufu',
          description: 'Feuilles de manioc pilées',
          price: 5500,
          image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
          category: 'Plats congolais',
          available: true,
        },
        quantity: 1,
      },
    ],
    totalAmount: 22500,
    deliveryFee: 2000,
    status: 'in_transit',
    pickupAddress: 'Restaurant Chez Mama, Av. Lumumba, Gombe',
    deliveryAddress: '45 Av. du Commerce, Lingwala, Kinshasa',
    clientName: 'Isaac Akonkwa',
    clientPhone: '+243810000001',
    notes: 'Sonner à la porte principale',
    timeline: generateOrderTimeline('in_transit'),
    createdAt: new Date().toISOString(),
    estimatedDelivery: '25 min',
    deliveryPin: '4829',
  },
  {
    id: 'ORD-002',
    clientId: 'client-001',
    serviceType: 'groceries',
    items: [
      {
        product: {
          id: 'g1',
          serviceId: 'groceries',
          name: 'Bananes Plantains',
          description: 'Régime de bananes plantains',
          price: 3000,
          image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
          category: 'Fruits',
          available: true,
        },
        quantity: 2,
      },
    ],
    totalAmount: 6000,
    deliveryFee: 1500,
    status: 'delivered',
    pickupAddress: 'Marché Central, Kinshasa',
    deliveryAddress: '45 Av. du Commerce, Lingwala, Kinshasa',
    clientName: 'Isaac Akonkwa',
    clientPhone: '+243810000001',
    timeline: generateOrderTimeline('delivered'),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deliveryPin: '7213',
  },
];

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'MSN-001',
    orderId: 'ORD-003',
    clientName: 'Patrick Kabongo',
    clientPhone: '+243810000010',
    pickupAddress: 'Restaurant Le Prestige, Av. de la Paix, Gombe',
    deliveryAddress: '78 Av. Kabinda, Barumbu, Kinshasa',
    serviceType: 'food',
    items: [
      {
        product: {
          id: 'f4',
          serviceId: 'food',
          name: 'Brochettes Mishkaki',
          description: 'Brochettes de boeuf grillées',
          price: 6000,
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          category: 'Grillades',
          available: true,
        },
        quantity: 3,
      },
    ],
    totalAmount: 18000,
    deliveryFee: 2500,
    status: 'pending',
    createdAt: new Date().toISOString(),
    deliveryPin: '5619',
  },
  {
    id: 'MSN-002',
    orderId: 'ORD-004',
    clientName: 'Grace Mulumba',
    clientPhone: '+243810000011',
    pickupAddress: 'Pharmacie du Boulevard, Av. du 30 Juin',
    deliveryAddress: '12 Rue Mbuji-Mayi, Kasa-Vubu',
    serviceType: 'pharmacy',
    items: [
      {
        product: {
          id: 'p1',
          serviceId: 'pharmacy',
          name: 'Paracétamol 500mg',
          description: 'Boîte de 20 comprimés',
          price: 2500,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
          category: 'Douleur',
          available: true,
        },
        quantity: 2,
      },
    ],
    totalAmount: 5000,
    deliveryFee: 1500,
    status: 'pending',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    deliveryPin: '3847',
  },
];

export const COMPLETED_MISSIONS: Mission[] = [
  {
    id: 'MSN-100',
    orderId: 'ORD-100',
    clientName: 'Espoir Tshimanga',
    clientPhone: '+243810000020',
    pickupAddress: 'Chez Ntemba, Av. Kasa-Vubu',
    deliveryAddress: '33 Rue Lubumbashi, Ngiri-Ngiri',
    serviceType: 'food',
    items: [
      {
        product: {
          id: 'f1',
          serviceId: 'food',
          name: 'Poulet Moambé',
          description: 'Poulet braisé sauce moambé',
          price: 8500,
          image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
          category: 'Plats congolais',
          available: true,
        },
        quantity: 1,
      },
    ],
    totalAmount: 8500,
    deliveryFee: 2000,
    status: 'delivered',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    deliveryPin: '9182',
  },
  {
    id: 'MSN-101',
    orderId: 'ORD-101',
    clientName: 'Bénie Kapinga',
    clientPhone: '+243810000021',
    pickupAddress: 'Marché de la Liberté, Masina',
    deliveryAddress: '56 Av. Colonel Mondjiba, Ngaliema',
    serviceType: 'groceries',
    items: [
      {
        product: {
          id: 'g2',
          serviceId: 'groceries',
          name: 'Sac de Riz 5kg',
          description: 'Riz long grain',
          price: 9500,
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
          category: 'Céréales',
          available: true,
        },
        quantity: 1,
      },
    ],
    totalAmount: 9500,
    deliveryFee: 3000,
    status: 'delivered',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deliveryPin: '6473',
  },
];
