import { Service } from '@/types';

export const SERVICES: Service[] = [
  {
    id: 'food',
    name: 'Restaurant',
    type: 'food',
    icon: 'UtensilsCrossed',
    color: '#FF7A1A',
    bg: '#FFF0E6',
    description: 'Plats locaux et internationaux livrés chaud',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacie',
    type: 'pharmacy',
    icon: 'Pill',
    color: '#DC2626',
    bg: '#FEE2E2',
    description: 'Médicaments et produits de santé',
  },
  {
    id: 'shop',
    name: 'Boutique',
    type: 'shop',
    icon: 'ShoppingBag',
    color: '#2563EB',
    bg: '#DBEAFE',
    description: 'Vêtements, électronique et plus',
  },
  {
    id: 'groceries',
    name: 'Courses',
    type: 'groceries',
    icon: 'Apple',
    color: '#0A8F7B',
    bg: '#E6F5F2',
    description: 'Fruits, légumes et produits du marché',
  },
  {
    id: 'parcel',
    name: 'Colis',
    type: 'parcel',
    icon: 'Package',
    color: '#7C3AED',
    bg: '#F3E8FF',
    description: 'Envoyez un colis à travers la ville',
  },
];
