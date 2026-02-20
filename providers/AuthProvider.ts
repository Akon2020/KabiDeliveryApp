import { useState, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, UserRole } from '@/types';
import { MOCK_USERS } from '@/mocks/auth';

const STORAGE_KEYS = {
  USER: 'khabi_user',
  ONBOARDED: 'khabi_onboarded',
  GPS_GRANTED: 'khabi_gps',
} as const;

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [hasGrantedGPS, setHasGrantedGPS] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string>('');

  const stateQuery = useQuery({
    queryKey: ['auth-persisted-state'],
    queryFn: async () => {
      console.log('[AuthProvider] Loading persisted state...');
      const [userData, onboarded, gps] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.GPS_GRANTED),
      ]);
      console.log('[AuthProvider] Loaded:', { userData: !!userData, onboarded, gps });
      return {
        user: userData ? (JSON.parse(userData) as User) : null,
        isOnboarded: onboarded === 'true',
        hasGrantedGPS: gps === 'true',
      };
    },
  });

  useEffect(() => {
    if (stateQuery.data) {
      setUser(stateQuery.data.user);
      setIsOnboarded(stateQuery.data.isOnboarded);
      setHasGrantedGPS(stateQuery.data.hasGrantedGPS);
    }
  }, [stateQuery.data]);

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      console.log('[AuthProvider] Completing onboarding');
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
      setIsOnboarded(true);
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (otp: string) => {
      console.log('[AuthProvider] Verifying OTP for phone:', pendingPhone);
      const fullPhone = `+243${pendingPhone}`;
      const mockUser = MOCK_USERS[fullPhone];

      if (!mockUser) {
        throw new Error('Numéro non reconnu. Utilisez les credentials de test.');
      }
      if (mockUser.otp !== otp) {
        throw new Error('Code OTP invalide');
      }
      if (selectedRole && mockUser.role !== selectedRole) {
        throw new Error(
          `Ce numéro est associé à un compte ${mockUser.role === 'client' ? 'client' : 'livreur'}`
        );
      }

      const userData: User = {
        id: mockUser.id,
        phone: mockUser.phone,
        name: mockUser.name,
        role: mockUser.role,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
      console.log('[AuthProvider] User authenticated:', userData.name);
      return userData;
    },
  });

  const grantGPS = useMutation({
    mutationFn: async () => {
      console.log('[AuthProvider] GPS permission granted');
      await AsyncStorage.setItem(STORAGE_KEYS.GPS_GRANTED, 'true');
      setHasGrantedGPS(true);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      console.log('[AuthProvider] Logging out');
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.GPS_GRANTED]);
      setUser(null);
      setHasGrantedGPS(false);
      setSelectedRole(null);
      setPendingPhone('');
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isOnboarded,
    hasGrantedGPS,
    selectedRole,
    pendingPhone,
    isLoading: stateQuery.isLoading,
    setSelectedRole,
    setPendingPhone,
    completeOnboarding,
    verifyOtp,
    grantGPS,
    logout,
  };
});
