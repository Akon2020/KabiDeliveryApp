import { useEffect, useState, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Camera, Trash2, Phone, User as UserIcon, AlertCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

type ImagePickerModule = typeof import('expo-image-picker');
let ImagePickerRef: ImagePickerModule | null = null;
let ImagePickerLoadFailed = false;

function loadImagePicker(): ImagePickerModule | null {
  if (ImagePickerRef || ImagePickerLoadFailed) return ImagePickerRef;
  try {
    ImagePickerRef = require('expo-image-picker') as ImagePickerModule;
    return ImagePickerRef;
  } catch (err) {
    console.log('[edit-profile] expo-image-picker unavailable:', err);
    ImagePickerLoadFailed = true;
    return null;
  }
}

export default function EditProfileScreen() {
  const { user, profilePhoto, setProfilePhotoUri, updateProfile } = useAuth();
  const [name, setName] = useState<string>(user?.name ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(profilePhoto);
  const [pickerAvailable, setPickerAvailable] = useState<boolean>(true);
  const [picking, setPicking] = useState<boolean>(false);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  useEffect(() => {
    setPhotoUri(profilePhoto);
  }, [profilePhoto]);

  useEffect(() => {
    const mod = loadImagePicker();
    setPickerAvailable(!!mod);
  }, []);

  const handleChoosePhoto = useCallback(async () => {
    const Picker = loadImagePicker();
    if (!Picker) {
      setPickerAvailable(false);
      Alert.alert(
        'Module indisponible',
        "La sélection de photo n'est pas disponible sur cet environnement.",
      );
      return;
    }
    try {
      setPicking(true);
      const perm = await Picker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Autorisez l\'accès à la galerie pour choisir une photo.',
        );
        return;
      }
      const result = await Picker.launchImageLibraryAsync({
        mediaTypes: Picker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.log('[edit-profile] picker error', err);
      Alert.alert('Erreur', "Impossible d'ouvrir la galerie.");
    } finally {
      setPicking(false);
    }
  }, []);

  const handleRemovePhoto = useCallback(() => {
    Alert.alert('Supprimer la photo', 'Voulez-vous retirer votre photo de profil ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => setPhotoUri(null),
      },
    ]);
  }, []);

  const handleSave = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Champ requis', 'Veuillez saisir votre nom.');
      return;
    }
    try {
      await updateProfile.mutateAsync({ name: trimmed });
      await setProfilePhotoUri(photoUri);
      router.back();
    } catch (err) {
      console.log('[edit-profile] save error', err);
      Alert.alert('Erreur', "Impossible d'enregistrer le profil. Réessayez.");
    }
  }, [name, photoUri, setProfilePhotoUri, updateProfile]);

  const initial = (name.trim().charAt(0) || user?.name?.charAt(0) || 'U').toUpperCase();
  const isSaving = updateProfile.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Mon profil' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}

          <View style={styles.photoButtonsRow}>
            <TouchableOpacity
              style={[
                styles.photoButton,
                (!pickerAvailable || picking) && styles.photoButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleChoosePhoto}
              disabled={!pickerAvailable || picking}
              testID="choose-photo"
            >
              {picking ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Camera size={16} color={theme.primary} strokeWidth={2} />
              )}
              <Text style={styles.photoButtonText}>Choisir une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoButton, styles.photoButtonDanger, !photoUri && styles.photoButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleRemovePhoto}
              disabled={!photoUri}
              testID="remove-photo"
            >
              <Trash2 size={16} color={theme.error} strokeWidth={2} />
              <Text style={[styles.photoButtonText, styles.photoButtonTextDanger]}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>

          {!pickerAvailable ? (
            <View style={styles.warningRow}>
              <AlertCircle size={14} color={theme.error} strokeWidth={2} />
              <Text style={styles.warningText}>Module indisponible</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.fieldLabel}>Nom complet</Text>
        <View style={styles.inputCard}>
          <UserIcon size={18} color={theme.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Votre nom"
            placeholderTextColor={theme.textLight}
            autoCapitalize="words"
            testID="name-input"
          />
        </View>

        <Text style={styles.fieldLabel}>Numéro de téléphone</Text>
        <View style={[styles.inputCard, styles.inputCardDisabled]}>
          <Phone size={18} color={theme.textSecondary} strokeWidth={2} />
          <Text style={styles.disabledText}>{user?.phone ?? ''}</Text>
        </View>
        <Text style={styles.hint}>
          Le numéro de téléphone ne peut pas être modifié.
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={isSaving}
          testID="save-profile"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: theme.divider,
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 44,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
  },
  photoButtonDanger: {
    backgroundColor: theme.errorLight,
  },
  photoButtonDisabled: {
    opacity: 0.5,
  },
  photoButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  photoButtonTextDanger: {
    color: theme.error,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    color: theme.error,
    fontWeight: '500' as const,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.textSecondary,
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputCardDisabled: {
    backgroundColor: theme.divider,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    paddingVertical: 14,
  },
  disabledText: {
    flex: 1,
    fontSize: 15,
    color: theme.textSecondary,
    paddingVertical: 14,
  },
  hint: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 6,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
