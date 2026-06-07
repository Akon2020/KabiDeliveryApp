import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Globe, SunMedium, Moon, Smartphone, Bell, FileText, ShieldCheck, Info } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useSettings, AppLanguage, AppThemeMode } from '@/providers/SettingsProvider';
import { useNotifications } from '@/providers/NotificationsProvider';

const APP_VERSION = '1.0.0';
const PRIVACY_URL = 'https://kabi.app/privacy';
const TERMS_URL = 'https://kabi.app/terms';

interface ChipOption<T extends string> {
  id: T;
  label: string;
  icon?: typeof SunMedium;
}

const LANG_OPTIONS: ChipOption<AppLanguage>[] = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
];

const THEME_OPTIONS: ChipOption<AppThemeMode>[] = [
  { id: 'system', label: 'Système', icon: Smartphone },
  { id: 'light', label: 'Clair', icon: SunMedium },
  { id: 'dark', label: 'Sombre', icon: Moon },
];

export default function SettingsScreen() {
  const { language, themeMode, notificationsEnabled, update } = useSettings();
  const { requestPermission } = useNotifications();

  const handleNotificationsToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Permission refusée',
            'Activez les notifications dans les paramètres système pour les recevoir.',
          );
          update({ notificationsEnabled: false });
          return;
        }
      }
      update({ notificationsEnabled: value });
    },
    [requestPermission, update],
  );

  const openLink = useCallback((url: string) => {
    Linking.openURL(url).catch((e) => {
      console.log('[settings] openURL error', e);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien.');
    });
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Paramètres' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={18} color={theme.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Langue</Text>
          </View>
          <View style={styles.chipsRow}>
            {LANG_OPTIONS.map((opt) => {
              const active = language === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => update({ language: opt.id })}
                  testID={`lang-${opt.id}`}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SunMedium size={18} color={theme.accent} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Thème</Text>
          </View>
          <View style={styles.chipsRow}>
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon ?? SunMedium;
              const active = themeMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => update({ themeMode: opt.id })}
                  testID={`theme-${opt.id}`}
                >
                  <Icon
                    size={14}
                    color={active ? '#FFF' : theme.textSecondary}
                    strokeWidth={2}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={18} color="#7C3AED" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.rowCard}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Activer les notifications</Text>
              <Text style={styles.rowHint}>
                Recevez les mises à jour de vos commandes en temps réel
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFF"
              testID="notifications-switch"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={18} color={theme.textSecondary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>À propos</Text>
          </View>
          <View style={styles.aboutCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>{APP_VERSION}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.aboutRow}
              activeOpacity={0.85}
              onPress={() => openLink(TERMS_URL)}
              testID="open-terms"
            >
              <View style={styles.aboutLeft}>
                <FileText size={16} color={theme.textSecondary} strokeWidth={2} />
                <Text style={styles.rowLabel}>Conditions d&apos;utilisation</Text>
              </View>
              <Text style={styles.linkText}>Ouvrir</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.aboutRow}
              activeOpacity={0.85}
              onPress={() => openLink(PRIVACY_URL)}
              testID="open-privacy"
            >
              <View style={styles.aboutLeft}>
                <ShieldCheck size={16} color={theme.textSecondary} strokeWidth={2} />
                <Text style={styles.rowLabel}>Politique de confidentialité</Text>
              </View>
              <Text style={styles.linkText}>Ouvrir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.text,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  rowTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 2,
  },
  rowHint: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  rowValue: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500' as const,
  },
  aboutCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  aboutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.divider,
  },
});
