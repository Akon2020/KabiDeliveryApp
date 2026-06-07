import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Banknote, Info } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { PAYMENT_METHODS } from '@/mocks/payments';
import { PaymentMethod } from '@/types';

const STORAGE_KEY = 'khabi_payment_numbers';

type NumbersMap = Record<string, string>;

export default function PaymentMethodsScreen() {
  const [numbers, setNumbers] = useState<NumbersMap>({});
  const [drafts, setDrafts] = useState<NumbersMap>({});
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as NumbersMap;
            setNumbers(parsed);
            setDrafts(parsed);
          } catch (e) {
            console.log('[payment-methods] parse error', e);
          }
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const persist = useCallback((next: NumbersMap) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((e) =>
      console.log('[payment-methods] persist error', e),
    );
  }, []);

  const handleUpdate = useCallback(
    (methodId: PaymentMethod) => {
      const value = (drafts[methodId] ?? '').trim();
      const next: NumbersMap = { ...numbers };
      if (value) next[methodId] = value;
      else delete next[methodId];
      setNumbers(next);
      persist(next);
      Alert.alert('Enregistré', 'Votre numéro a été mis à jour.');
    },
    [drafts, numbers, persist],
  );

  const editableMethods = PAYMENT_METHODS.filter((m) => m.id !== 'cash');
  const cashMethod = PAYMENT_METHODS.find((m) => m.id === 'cash');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Moyens de paiement' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Enregistrez vos numéros pour payer plus rapidement.
        </Text>

        {editableMethods.map((method) => {
          const draftValue = drafts[method.id] ?? '';
          const savedValue = numbers[method.id] ?? '';
          const dirty = hydrated && draftValue.trim() !== savedValue;
          return (
            <View key={method.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.logoWrap, { backgroundColor: method.bg }]}>
                  {method.iconUrl ? (
                    <Image
                      source={{ uri: method.iconUrl }}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={[styles.logoFallback, { color: method.color }]}>
                      {method.label.charAt(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardLabel}>{method.label}</Text>
                  <Text style={styles.cardDescription}>{method.description}</Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Numéro enregistré</Text>
              <View style={styles.inputCard}>
                <Text style={styles.prefix}>+243</Text>
                <TextInput
                  style={styles.input}
                  value={draftValue}
                  onChangeText={(v) =>
                    setDrafts((prev) => ({ ...prev, [method.id]: v }))
                  }
                  placeholder="8XXXXXXXX"
                  placeholderTextColor={theme.textLight}
                  keyboardType="phone-pad"
                  maxLength={12}
                  testID={`number-${method.id}`}
                />
              </View>

              <TouchableOpacity
                style={[styles.updateButton, !dirty && styles.updateButtonDisabled]}
                activeOpacity={0.85}
                disabled={!dirty}
                onPress={() => handleUpdate(method.id)}
                testID={`update-${method.id}`}
              >
                <Text style={styles.updateButtonText}>Mettre à jour</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {cashMethod ? (
          <View style={styles.cashCard}>
            <View style={[styles.logoWrap, { backgroundColor: cashMethod.bg }]}>
              <Banknote size={22} color={cashMethod.color} strokeWidth={2} />
            </View>
            <View style={styles.cashTextWrap}>
              <Text style={styles.cardLabel}>{cashMethod.label}</Text>
              <Text style={styles.cardDescription}>{cashMethod.description}</Text>
              <View style={styles.cashHintRow}>
                <Info size={12} color={theme.textLight} strokeWidth={2} />
                <Text style={styles.cashHint}>
                  Aucun numéro requis — payez directement au livreur.
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoFallback: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bg,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  prefix: {
    fontSize: 15,
    color: theme.textSecondary,
    fontWeight: '600' as const,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    paddingVertical: 12,
  },
  updateButton: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: theme.textLight,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  cashCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cashTextWrap: {
    flex: 1,
  },
  cashHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  cashHint: {
    fontSize: 12,
    color: theme.textLight,
    flex: 1,
    lineHeight: 16,
  },
});
