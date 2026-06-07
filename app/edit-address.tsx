import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Home, Briefcase, MapPin } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAddresses, AddressKind } from '@/providers/AddressesProvider';
import KhabiMap from '@/components/KhabiMap';

interface KindOption {
  id: AddressKind;
  label: string;
  icon: typeof Home;
}

const KIND_OPTIONS: KindOption[] = [
  { id: 'home', label: 'Maison', icon: Home },
  { id: 'work', label: 'Travail', icon: Briefcase },
  { id: 'other', label: 'Autre', icon: MapPin },
];

export default function EditAddressScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { addresses, addAddress, updateAddress } = useAddresses();

  const editing = useMemo(
    () => (params.id ? addresses.find((a) => a.id === params.id) : undefined),
    [addresses, params.id],
  );

  const [label, setLabel] = useState<string>('');
  const [kind, setKind] = useState<AddressKind>('home');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);

  useEffect(() => {
    if (editing) {
      setLabel(editing.label);
      setKind(editing.kind);
      setFullAddress(editing.fullAddress);
      setDetails(editing.details ?? '');
      setIsDefault(!!editing.isDefault);
    }
  }, [editing]);

  const handleSave = () => {
    const trimmedLabel = label.trim();
    const trimmedAddress = fullAddress.trim();
    if (!trimmedLabel) {
      Alert.alert('Champ requis', 'Veuillez saisir un libellé pour cette adresse.');
      return;
    }
    if (!trimmedAddress) {
      Alert.alert('Champ requis', 'Veuillez saisir l\'adresse complète.');
      return;
    }

    if (editing) {
      updateAddress(editing.id, {
        label: trimmedLabel,
        kind,
        fullAddress: trimmedAddress,
        details: details.trim() || undefined,
        isDefault,
      });
    } else {
      addAddress({
        label: trimmedLabel,
        kind,
        fullAddress: trimmedAddress,
        details: details.trim() || undefined,
        isDefault,
      });
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{ title: editing ? 'Modifier l\'adresse' : 'Nouvelle adresse' }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <KhabiMap height={160} />

        <Text style={styles.sectionTitle}>Type d&apos;adresse</Text>
        <View style={styles.chipsRow}>
          {KIND_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = kind === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
                onPress={() => setKind(opt.id)}
                testID={`kind-${opt.id}`}
              >
                <Icon
                  size={16}
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

        <Text style={styles.sectionTitle}>Libellé</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Ex. Maison, Bureau..."
            placeholderTextColor={theme.textLight}
            testID="address-label-input"
          />
        </View>

        <Text style={styles.sectionTitle}>Adresse complète</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={fullAddress}
            onChangeText={setFullAddress}
            placeholder="Rue, avenue, quartier, commune"
            placeholderTextColor={theme.textLight}
            multiline
            numberOfLines={2}
            testID="address-full-input"
          />
        </View>

        <Text style={styles.sectionTitle}>Détails (facultatif)</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            value={details}
            onChangeText={setDetails}
            placeholder="Bâtiment, étage, code, point de repère"
            placeholderTextColor={theme.textLight}
            testID="address-details-input"
          />
        </View>

        <View style={styles.switchCard}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchLabel}>Adresse par défaut</Text>
            <Text style={styles.switchHint}>
              Utilisée automatiquement pour vos commandes
            </Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFF"
            testID="address-default-switch"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSave}
          testID="save-address"
        >
          <Text style={styles.saveButtonText}>
            {editing ? 'Enregistrer les modifications' : 'Ajouter l\'adresse'}
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: theme.text,
    marginTop: 20,
    marginBottom: 10,
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
  inputCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  input: {
    fontSize: 15,
    color: theme.text,
    paddingVertical: 14,
  },
  inputMultiline: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  switchCard: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  switchTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 2,
  },
  switchHint: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
