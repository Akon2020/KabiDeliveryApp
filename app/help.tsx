import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { ChevronDown, MessageCircle, HelpCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    id: 'order',
    question: 'Comment passer une commande ?',
    answer:
      "Sélectionnez un service sur l'accueil, choisissez vos articles, validez le panier et payez.",
  },
  {
    id: 'track',
    question: 'Comment suivre ma livraison ?',
    answer:
      "Rendez-vous dans l'onglet Commandes pour voir le statut en temps réel.",
  },
  {
    id: 'cancel',
    question: 'Comment annuler une commande ?',
    answer:
      "Ouvrez la commande et tapez sur 'Annuler' tant qu'elle n'a pas été récupérée.",
  },
  {
    id: 'payment',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'M-Pesa, Airtel Money, Orange Money et paiement à la livraison.',
  },
  {
    id: 'late',
    question: 'Mon livreur est en retard, que faire ?',
    answer: "Vous pouvez l'appeler directement depuis l'écran de suivi.",
  },
];

const SUPPORT_URL = 'https://wa.me/243810000000';

export default function HelpScreen() {
  const [expanded, setExpanded] = useState<string | null>(FAQS[0]?.id ?? null);

  const toggle = useCallback((id: string) => {
    setExpanded((cur) => (cur === id ? null : id));
  }, []);

  const handleSupport = useCallback(() => {
    Linking.openURL(SUPPORT_URL).catch((e) => {
      console.log('[help] openURL error', e);
      Alert.alert(
        'WhatsApp indisponible',
        "Impossible d'ouvrir WhatsApp sur cet appareil.",
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Aide & Support' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <HelpCircle size={28} color={theme.primary} strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>Questions fréquentes</Text>
          <Text style={styles.headerSubtitle}>
            Trouvez rapidement des réponses aux questions courantes.
          </Text>
        </View>

        {FAQS.map((faq) => {
          const isOpen = expanded === faq.id;
          return (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                activeOpacity={0.85}
                onPress={() => toggle(faq.id)}
                testID={`faq-${faq.id}`}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <View style={[styles.chevronWrap, isOpen && styles.chevronWrapOpen]}>
                  <ChevronDown
                    size={18}
                    color={isOpen ? '#FFF' : theme.textSecondary}
                    strokeWidth={2.2}
                  />
                </View>
              </TouchableOpacity>
              {isOpen ? (
                <View style={styles.faqBody}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.supportButton}
          activeOpacity={0.85}
          onPress={handleSupport}
          testID="contact-support"
        >
          <MessageCircle size={20} color="#FFF" strokeWidth={2} />
          <Text style={styles.supportButtonText}>Contacter le support</Text>
        </TouchableOpacity>

        <Text style={styles.supportHint}>
          Notre équipe vous répond du lundi au samedi, de 8h à 20h.
        </Text>
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
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.primaryLight,
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
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  faqCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.text,
    marginRight: 12,
  },
  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronWrapOpen: {
    backgroundColor: theme.primary,
    transform: [{ rotate: '180deg' }],
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 21,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 24,
  },
  supportButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  supportHint: {
    fontSize: 12,
    color: theme.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
});
