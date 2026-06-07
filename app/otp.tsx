import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const OTP_LENGTH = 4;

export default function OtpScreen() {
  const { pendingPhone, verifyOtp, resendOtp, selectedRole } = useAuth();
  const [code, setCode] = useState<string>('');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const inputRef = useRef<TextInput | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resendOtp.isPending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await resendOtp.mutateAsync();
      setResendCooldown(30);
      Alert.alert('Code envoyé', 'Un nouveau code a été envoyé à votre numéro.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de renvoi';
      Alert.alert('Erreur', message);
    }
  }, [resendCooldown, resendOtp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setFocusedIndex(code.length < OTP_LENGTH ? code.length : OTP_LENGTH - 1);
  }, [code]);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleChangeText = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setCode(cleaned);
  }, []);

  const handleVerify = useCallback(async () => {
    if (code.length !== OTP_LENGTH) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await verifyOtp.mutateAsync(code);
      console.log('[OTP] Verified, navigating to GPS permission');
      router.replace('/gps-permission' as any);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de vérification';
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', message);
      setCode('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [code, verifyOtp, shake]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const digits = code.split('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.shieldIcon}>
            <ShieldCheck size={28} color={theme.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Code envoyé au{' '}
            <Text style={styles.phoneHighlight}>+243 {pendingPhone}</Text>
          </Text>
        </View>

        <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
          <Pressable style={styles.otpBoxes} onPress={focusInput}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  focusedIndex === index && code.length < OTP_LENGTH && styles.otpBoxFocused,
                  digits[index] ? styles.otpBoxFilled : null,
                ]}
              >
                <Text style={styles.otpDigit}>{digits[index] ?? ''}</Text>
              </View>
            ))}
          </Pressable>
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleChangeText}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus={false}
            caretHidden
            testID="otp-hidden-input"
          />
        </Animated.View>

        {verifyOtp.isError && (
          <Text style={styles.errorText}>
            {verifyOtp.error instanceof Error ? verifyOtp.error.message : 'Erreur'}
          </Text>
        )}

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={resendCooldown > 0 || resendOtp.isPending}
          testID="resend-button"
        >
          <Text
            style={[
              styles.resendText,
              (resendCooldown > 0 || resendOtp.isPending) && styles.resendTextDisabled,
            ]}
          >
            {resendCooldown > 0
              ? `Renvoyer dans ${resendCooldown}s`
              : resendOtp.isPending
                ? 'Envoi...'
                : 'Renvoyer le code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            code.length !== OTP_LENGTH && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={code.length !== OTP_LENGTH || verifyOtp.isPending}
          activeOpacity={0.85}
          testID="verify-button"
        >
          <Text style={styles.verifyButtonText}>
            {verifyOtp.isPending ? 'Vérification...' : 'Vérifier'}
          </Text>
        </TouchableOpacity>

        <View style={styles.testHint}>
          <Text style={styles.testHintText}>
            {selectedRole === 'driver' ? 'OTP test livreur : 5678' : 'OTP test client : 1234'}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
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
    marginBottom: 40,
  },
  shieldIcon: {
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
  phoneHighlight: {
    fontWeight: '600' as const,
    color: theme.text,
  },
  otpContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  otpBox: {
    width: 64,
    height: 72,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryLight,
  },
  otpDigit: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.text,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    fontSize: 14,
    color: theme.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    marginBottom: 32,
  },
  resendText: {
    fontSize: 15,
    color: theme.primary,
    fontWeight: '600' as const,
  },
  resendTextDisabled: {
    color: theme.textLight,
  },
  verifyButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  testHint: {
    marginTop: 24,
    alignItems: 'center',
  },
  testHintText: {
    fontSize: 13,
    color: theme.textLight,
    fontWeight: '500' as const,
  },
});
