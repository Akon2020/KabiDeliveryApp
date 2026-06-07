import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ArrowRight, User as UserIcon, Phone } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen() {
  const { selectedRole, setSelectedRole, setPendingPhone, registerUser } = useAuth();
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'client' | 'driver'>(selectedRole ?? 'client');
  const [error, setError] = useState<string>('');

  const isValid = name.trim().length >= 2 && phone.replace(/\s/g, '').length >= 9;

  const handleSubmit = useCallback(async () => {
    setError('');
    if (!isValid) {
      setError('Renseignez votre nom et un numéro à 9 chiffres minimum.');
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await registerUser.mutateAsync({ name, phone, role });
      setSelectedRole(role);
      setPendingPhone(phone.replace(/\s/g, ''));
      Alert.alert(
        'Compte créé',
        "Un code OTP de test (1234) vous est envoyé pour confirmer votre numéro.",
        [{ text: 'OK', onPress: () => router.replace('/otp' as any) }],
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    }
  }, [name, phone, role, isValid, registerUser, setPendingPhone, setSelectedRole]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Inscrivez-vous pour profiter de Kabi Delivery
          </Text>
        </View>

        <View style={styles.roleRow}>
          {(['client', 'driver'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, role === r && styles.roleChipActive]}
              onPress={() => setRole(r)}
              testID={`role-${r}`}
            >
              <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                {r === 'client' ? 'Client' : 'Livreur'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Nom complet</Text>
          <View style={styles.inputRow}>
            <UserIcon size={18} color={theme.textLight} strokeWidth={2} style={{ marginLeft: 14 }} />
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              placeholderTextColor={theme.textLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              testID="register-name"
            />
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Numéro de téléphone</Text>
          <View style={styles.inputRow}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇨🇩</Text>
              <Text style={styles.codeText}>+243</Text>
            </View>
            <View style={styles.inputDivider} />
            <TextInput
              style={styles.input}
              placeholder="81 000 0001"
              placeholderTextColor={theme.textLight}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={12}
              testID="register-phone"
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || registerUser.isPending}
          activeOpacity={0.85}
          testID="register-submit"
        >
          <Text style={styles.continueButtonText}>
            {registerUser.isPending ? 'Création...' : 'Créer mon compte'}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.testCard}>
          <Phone size={16} color={theme.primary} strokeWidth={2} />
          <Text style={styles.testCardText}>
            OTP de test après inscription : 1234
          </Text>
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.replace('/login' as any)}
        >
          <Text style={styles.loginLinkText}>
            Déjà un compte ? <Text style={styles.loginLinkStrong}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: theme.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700' as const, color: theme.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: theme.textSecondary, lineHeight: 22 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleChip: {
    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.border,
  },
  roleChipActive: { backgroundColor: theme.primaryLight, borderColor: theme.primary },
  roleChipText: { fontSize: 15, fontWeight: '600' as const, color: theme.textSecondary },
  roleChipTextActive: { color: theme.primary },
  inputSection: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600' as const, color: theme.text, marginBottom: 10 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface,
    borderRadius: 16, borderWidth: 1.5, borderColor: theme.border, overflow: 'hidden',
  },
  countryCode: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  flag: { fontSize: 20 },
  codeText: { fontSize: 15, fontWeight: '600' as const, color: theme.text },
  inputDivider: { width: 1, height: 26, backgroundColor: theme.border },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 16, fontSize: 16, color: theme.text },
  errorText: { fontSize: 13, color: theme.error, marginBottom: 12 },
  continueButton: {
    backgroundColor: theme.primary, borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12,
  },
  continueButtonDisabled: { opacity: 0.5 },
  continueButtonText: { fontSize: 17, fontWeight: '600' as const, color: '#FFFFFF' },
  testCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.primaryLight, borderRadius: 12, padding: 14, marginTop: 16,
  },
  testCardText: { fontSize: 13, color: theme.primaryDark, fontWeight: '500' as const, flex: 1 },
  loginLink: { alignSelf: 'center', marginTop: 16, paddingVertical: 14 },
  loginLinkText: { fontSize: 14, color: theme.textSecondary },
  loginLinkStrong: { color: theme.primary, fontWeight: '700' as const },
});
