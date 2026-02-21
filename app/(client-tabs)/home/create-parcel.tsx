import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Package, MapPin, User, Phone, FileText, Scale } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Order } from '@/types';
import { generateOrderTimeline } from '@/mocks/orders';
import * as Haptics from 'expo-haptics';

export default function CreateParcelScreen() {
  const { addOrder } = useOrders();
  const { user } = useAuth();

  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverPhone, setReceiverPhone] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const isValid = receiverName.trim() && receiverPhone.trim() && pickupAddress.trim() && deliveryAddress.trim() && description.trim();

  const handleSubmit = useCallback(() => {
    if (!isValid) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const fee = 3500;

    const order: Order = {
      id: orderId,
      clientId: user?.id ?? 'client-001',
      serviceType: 'parcel',
      items: [
        {
          product: {
            id: `parcel-${orderId}`,
            serviceId: 'parcel',
            name: `Colis: ${description}`,
            description: `Destinataire: ${receiverName} | Poids: ${weight || 'N/A'}`,
            price: fee,
            image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400',
            category: 'Colis',
            available: true,
          },
          quantity: 1,
        },
      ],
      totalAmount: fee,
      deliveryFee: 2500,
      status: 'pending',
      pickupAddress,
      deliveryAddress,
      clientName: user?.name ?? 'Isaac Akonkwa',
      clientPhone: user?.phone ?? '+243810000001',
      notes: notes || undefined,
      timeline: generateOrderTimeline('pending'),
      createdAt: new Date().toISOString(),
      estimatedDelivery: '45-60 min',
      deliveryPin: pin,
    };

    addOrder(order);

    router.replace({
      pathname: '/(client-tabs)/home/payment-method' as any,
      params: { orderId },
    });
  }, [isValid, receiverName, receiverPhone, pickupAddress, deliveryAddress, description, weight, notes, user, addOrder]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Envoyer un colis' }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Package size={28} color="#7C3AED" strokeWidth={1.8} />
          </View>
          <Text style={styles.headerTitle}>Nouveau colis</Text>
          <Text style={styles.headerDesc}>Remplissez les informations pour envoyer votre colis</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Destinataire</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <User size={18} color={theme.textLight} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Nom du destinataire *"
                placeholderTextColor={theme.textLight}
                value={receiverName}
                onChangeText={setReceiverName}
              />
            </View>
            <View style={styles.inputRow}>
              <Phone size={18} color={theme.textLight} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Téléphone du destinataire *"
                placeholderTextColor={theme.textLight}
                value={receiverPhone}
                onChangeText={setReceiverPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Adresses</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <MapPin size={18} color={theme.primary} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Adresse de retrait *"
                placeholderTextColor={theme.textLight}
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>
            <View style={styles.inputRow}>
              <MapPin size={18} color={theme.accent} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Adresse de livraison *"
                placeholderTextColor={theme.textLight}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description du colis</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <FileText size={18} color={theme.textLight} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Que contient le colis ? *"
                placeholderTextColor={theme.textLight}
                value={description}
                onChangeText={setDescription}
              />
            </View>
            <View style={styles.inputRow}>
              <Scale size={18} color={theme.textLight} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Poids estimé (ex: 2kg)"
                placeholderTextColor={theme.textLight}
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (optionnel)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Instructions spéciales..."
            placeholderTextColor={theme.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Frais d&apos;envoi estimés</Text>
          <Text style={styles.priceValue}>6 000 FC</Text>
          <Text style={styles.priceNote}>Le prix final sera confirmé après vérification</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid}
          activeOpacity={0.9}
          testID="submit-parcel"
        >
          <Text style={styles.submitButtonText}>Envoyer le colis</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 4,
  },
  headerDesc: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 10,
  },
  inputGroup: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 15,
    color: theme.text,
  },
  notesInput: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    fontSize: 15,
    color: theme.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priceCard: {
    backgroundColor: theme.accentLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 6,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: theme.accent,
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: theme.bg,
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
});
