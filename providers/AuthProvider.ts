import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, UserRole } from '@/types';
import { MOCK_USERS, MockUser } from '@/mocks/auth';

const STORAGE_KEYS = {
  USER: 'khabi_user',
  ONBOARDED: 'khabi_onboarded',
  GPS_GRANTED: 'khabi_gps',
  REGISTERED: 'khabi_registered_users',
  PROFILE_PHOTO: 'khabi_profile_photo',
} as const;

interface RegisterPayload {
  name: string;
  phone: string;
  role: UserRole;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [hasGrantedGPS, setHasGrantedGPS] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, MockUser>>({});
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const stateQuery = useQuery({
    queryKey: ['auth-persisted-state'],
    queryFn: async () => {
      console.log('[AuthProvider] Loading persisted state...');
      const [userData, onboarded, gps, registered, photo] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.GPS_GRANTED),
        AsyncStorage.getItem(STORAGE_KEYS.REGISTERED),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE_PHOTO),
      ]);
      console.log('[AuthProvider] Loaded:', { userData: !!userData, onboarded, gps });
      let parsedRegistered: Record<string, MockUser> = {};
      if (registered) {
        try {
          parsedRegistered = JSON.parse(registered) as Record<string, MockUser>;
        } catch {}
      }
      return {
        user: userData ? (JSON.parse(userData) as User) : null,
        isOnboarded: onboarded === 'true',
        hasGrantedGPS: gps === 'true',
        registeredUsers: parsedRegistered,
        profilePhoto: photo,
      };
    },
  });

  useEffect(() => {
    if (stateQuery.data) {
      setUser(stateQuery.data.user);
      setIsOnboarded(stateQuery.data.isOnboarded);
      setHasGrantedGPS(stateQuery.data.hasGrantedGPS);
      setRegisteredUsers(stateQuery.data.registeredUsers);
      setProfilePhoto(stateQuery.data.profilePhoto);
    }
  }, [stateQuery.data]);

  const lookupUser = useCallback(
    (fullPhone: string): MockUser | undefined => {
      return MOCK_USERS[fullPhone] ?? registeredUsers[fullPhone];
    },
    [registeredUsers],
  );

  const detectRoleFromPhone = useCallback(
    (rawPhone: string): UserRole | null => {
      const cleaned = rawPhone.replace(/\s/g, '');
      const fullPhone = `+243${cleaned}`;
      const found = lookupUser(fullPhone);
      return found?.role ?? null;
    },
    [lookupUser],
  );

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      console.log('[AuthProvider] Completing onboarding');
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
      setIsOnboarded(true);
    },
  });

  const registerUser = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const cleaned = payload.phone.replace(/\s/g, '');
      const fullPhone = `+243${cleaned}`;
      if (MOCK_USERS[fullPhone] || registeredUsers[fullPhone]) {
        throw new Error('Ce numéro est déjà associé à un compte.');
      }
      const newUser: MockUser = {
        id: `${payload.role}-${Date.now().toString().slice(-6)}`,
        phone: fullPhone,
        name: payload.name.trim(),
        role: payload.role,
        otp: '1234',
      };
      const next = { ...registeredUsers, [fullPhone]: newUser };
      setRegisteredUsers(next);
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED, JSON.stringify(next));
      console.log('[AuthProvider] Registered user (mock):', newUser.name, '(OTP: 1234)');
      return newUser;
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (otp: string) => {
      console.log('[AuthProvider] Verifying OTP for phone:', pendingPhone);
      const fullPhone = `+243${pendingPhone}`;
      const mockUser = lookupUser(fullPhone);

      if (!mockUser) {
        throw new Error('Numéro non reconnu. Inscrivez-vous d\'abord.');
      }
      if (mockUser.otp !== otp) {
        throw new Error('Code OTP invalide');
      }
      if (selectedRole && mockUser.role !== selectedRole) {
        throw new Error(
          `Ce numéro est associé à un compte ${mockUser.role === 'client' ? 'client' : 'livreur'}`,
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

  const resendOtp = useMutation({
    mutationFn: async () => {
      const fullPhone = `+243${pendingPhone}`;
      const mockUser = lookupUser(fullPhone);
      if (!mockUser) throw new Error('Numéro non reconnu.');
      console.log('[AuthProvider] (mock) OTP resent to', fullPhone, '— code:', mockUser.otp);
      await new Promise((r) => setTimeout(r, 600));
      return mockUser.otp;
    },
  });

  const grantGPS = useMutation({
    mutationFn: async () => {
      console.log('[AuthProvider] GPS permission granted');
      await AsyncStorage.setItem(STORAGE_KEYS.GPS_GRANTED, 'true');
      setHasGrantedGPS(true);
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (patch: Partial<Pick<User, 'name' | 'phone'>>) => {
      if (!user) throw new Error('Non connecté');
      const updated: User = { ...user, ...patch };
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      setUser(updated);
      return updated;
    },
  });

  const setProfilePhotoUri = useCallback(async (uri: string | null) => {
    setProfilePhoto(uri);
    if (uri) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_PHOTO, uri);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE_PHOTO);
    }
  }, []);

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
    profilePhoto,
    setSelectedRole,
    setPendingPhone,
    detectRoleFromPhone,
    completeOnboarding,
    registerUser,
    verifyOtp,
    resendOtp,
    grantGPS,
    updateProfile,
    setProfilePhotoUri,
    logout,
  };
});
