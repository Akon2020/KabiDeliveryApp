import { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ShoppingBag, Bike } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/constants/theme';
import { UserRole } from '@/types';
import * as Haptics from 'expo-haptics';

export default function RoleSelectScreen() {
  const { setSelectedRole } = useAuth();
  const clientScale = useRef(new Animated.Value(1)).current;
  const driverScale = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback((anim: Animated.Value, callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => callback());
  }, []);

  const handleSelect = useCallback((role: UserRole) => {
    const anim = role === 'client' ? clientScale : driverScale;
    animatePress(anim, () => {
      console.log('[RoleSelect] Selected role:', role);
      setSelectedRole(role);
      router.push('/login' as any);
    });
  }, [setSelectedRole, animatePress, clientScale, driverScale]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Qui êtes-vous ?</Text>
        <Text style={styles.subtitle}>
          Sélectionnez votre profil pour commencer
        </Text>
      </View>

      <View style={styles.cards}>
        <Animated.View style={{ transform: [{ scale: clientScale }] }}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect('client')}
            activeOpacity={1}
            testID="role-client"
          >
            <View style={[styles.cardIcon, { backgroundColor: theme.primaryLight }]}>
              <ShoppingBag size={36} color={theme.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.cardTitle}>Client</Text>
            <Text style={styles.cardDescription}>
              Commandez et recevez vos livraisons en un clic
            </Text>
            <View style={[styles.cardBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.cardBadgeText}>Commander</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: driverScale }] }}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect('driver')}
            activeOpacity={1}
            testID="role-driver"
          >
            <View style={[styles.cardIcon, { backgroundColor: theme.accentLight }]}>
              <Bike size={36} color={theme.accent} strokeWidth={1.8} />
            </View>
            <Text style={styles.cardTitle}>Livreur</Text>
            <Text style={styles.cardDescription}>
              Gagnez de l&apos;argent en livrant des commandes
            </Text>
            <View style={[styles.cardBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.cardBadgeText}>Livrer</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  cards: {
    gap: 20,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cardBadgeText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
