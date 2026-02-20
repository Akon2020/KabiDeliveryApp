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
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Phone, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/constants/theme';
import { TEST_CREDENTIALS } from '@/mocks/auth';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const { selectedRole, setPendingPhone } = useAuth();
  const [phone, setPhone] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleContinue = useCallback(() => {
    setError('');
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 9) {
      setError('Numéro de téléphone invalide (9 chiffres requis)');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('[Login] Phone submitted:', cleaned);
    setPendingPhone(cleaned);
    router.push('/otp' as any);
  }, [phone, setPendingPhone]);

  const testCred = selectedRole === 'driver' ? TEST_CREDENTIALS.driver : TEST_CREDENTIALS.client;

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
          <View style={styles.phoneIconContainer}>
            <Phone size={28} color={theme.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Entrez votre numéro de téléphone pour recevoir un code de vérification
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Numéro de téléphone</Text>
          <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
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
              onChangeText={(text) => {
                setPhone(text);
                setError('');
              }}
              maxLength={12}
              testID="phone-input"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.testCredentials}>
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>TEST</Text>
          </View>
          <Text style={styles.testText}>
            {selectedRole === 'driver' ? 'Livreur' : 'Client'} : {testCred.phone} / OTP : {testCred.otp}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, phone.length < 9 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={phone.length < 9}
          activeOpacity={0.85}
          testID="continue-button"
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 32,
  },
  header: {
    marginBottom: 36,
  },
  phoneIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  inputRowError: {
    borderColor: theme.error,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  flag: {
    fontSize: 22,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.text,
  },
  inputDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 17,
    color: theme.text,
    fontWeight: '500' as const,
  },
  errorText: {
    fontSize: 13,
    color: theme.error,
    marginTop: 8,
    marginLeft: 4,
  },
  testCredentials: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 32,
    gap: 10,
  },
  testBadge: {
    backgroundColor: theme.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  testBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  testText: {
    fontSize: 13,
    color: theme.primaryDark,
    fontWeight: '500' as const,
    flex: 1,
  },
  continueButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
