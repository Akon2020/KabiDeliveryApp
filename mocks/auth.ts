import { User } from '@/types';

export interface MockUser extends User {
  otp: string;
}

export const MOCK_USERS: Record<string, MockUser> = {
  '+243810000001': {
    id: 'client-001',
    phone: '+243810000001',
    name: 'Isaac Akonkwa',
    role: 'client',
    otp: '1234',
  },
  '+243810000002': {
    id: 'driver-001',
    phone: '+243810000002',
    name: 'Isaac Uriel',
    role: 'driver',
    otp: '5678',
  },
};

export const TEST_CREDENTIALS = {
  client: { phone: '810000001', otp: '1234' },
  driver: { phone: '810000002', otp: '5678' },
};
