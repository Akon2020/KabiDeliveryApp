import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { FileText, Download, Share2, Home, ChevronRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useOrders } from '@/providers/OrdersProvider';
import { usePayment } from '@/providers/PaymentProvider';
import { useAuth } from '@/providers/AuthProvider';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function buildReceiptHtml(params: {
  orderId: string;
  date: string;
  clientName: string;
  methodLabel: string;
  transactionRef?: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: string;
  deliveryFee: string;
  total: string;
}) {
  const itemsRows = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;color:#6B7A8D;font-size:13px;">${item.qty}x ${item.name}</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;color:#0B1728;font-size:13px;">${(item.price * item.qty).toLocaleString()} FC</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @page { margin: 24px; }
    body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 24px; background: #F7FAF9; color: #0B1728; }
    .card { background: #fff; border-radius: 16px; padding: 28px 24px; max-width: 420px; margin: 0 auto; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .header { text-align: center; margin-bottom: 20px; }
    .logo-circle { width: 52px; height: 52px; border-radius: 14px; background: #E6F5F2; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px; }
    .logo-circle svg { width: 26px; height: 26px; }
    .brand { font-size: 20px; font-weight: 700; color: #0B1728; margin: 0; }
    .subtitle { font-size: 13px; color: #6B7A8D; margin: 4px 0 0; }
    .divider { border: none; border-top: 1px dashed #E8EEF2; margin: 16px 0; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table td { padding: 6px 0; font-size: 13px; }
    .info-table .label { color: #6B7A8D; }
    .info-table .value { text-align: right; font-weight: 600; color: #0B1728; }
    .items-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .items-table { width: 100%; border-collapse: collapse; }
    .totals-table { width: 100%; border-collapse: collapse; }
    .totals-table .label { color: #6B7A8D; font-size: 13px; padding: 6px 0; }
    .totals-table .value { text-align: right; font-weight: 500; font-size: 14px; padding: 6px 0; }
    .grand-total .label { font-size: 16px; font-weight: 700; color: #0B1728; }
    .grand-total .value { font-size: 20px; font-weight: 800; color: #0A8F7B; }
    .badge { display: inline-block; background: #DCFCE7; border-radius: 8px; padding: 5px 16px; font-size: 13px; font-weight: 700; color: #22C55E; letter-spacing: 1px; margin-top: 12px; }
    .footer { text-align: center; margin-top: 8px; }
    .footer-text { font-size: 12px; color: #6B7A8D; margin-top: 8px; }
    .watermark { text-align: center; margin-top: 20px; font-size: 10px; color: #9BA8B7; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="#0A8F7B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
      </div>
      <p class="brand">Kabi Delivery</p>
      <p class="subtitle">Reçu de paiement</p>
    </div>
    <hr class="divider"/>
    <table class="info-table">
      <tr><td class="label">N° Commande</td><td class="value">${params.orderId}</td></tr>
      <tr><td class="label">Date</td><td class="value">${params.date}</td></tr>
      <tr><td class="label">Client</td><td class="value">${params.clientName}</td></tr>
      <tr><td class="label">Paiement</td><td class="value">${params.methodLabel}</td></tr>
      ${params.transactionRef ? `<tr><td class="label">Réf. transaction</td><td class="value" style="color:#0A8F7B;">${params.transactionRef}</td></tr>` : ''}
    </table>
    <hr class="divider"/>
    <p class="items-title">Articles</p>
    <table class="items-table">${itemsRows}</table>
    <hr class="divider"/>
    <table class="totals-table">
      <tr><td class="label">Sous-total</td><td class="value">${params.subtotal} FC</td></tr>
      <tr><td class="label">Frais de livraison</td><td class="value">${params.deliveryFee} FC</td></tr>
    </table>
    <hr class="divider"/>
    <table class="totals-table">
      <tr class="grand-total"><td class="label">Total payé</td><td class="value">${params.total} FC</td></tr>
    </table>
    <div class="footer">
      <span class="badge">PAYÉ</span>
      <p class="footer-text">Merci pour votre commande !</p>
    </div>
  </div>
  <p class="watermark">Kabi Delivery — RDC</p>
</body>
</html>`;
}

export default function ReceiptScreen() {
  const { orderId, paymentId } = useLocalSearchParams<{ orderId: string; paymentId: string }>();
  const { orders } = useOrders();
  const { payments, currentPayment } = usePayment();
  const { user } = useAuth();

  const order = orders.find((o) => o.id === orderId);
  const payment = payments.find((p) => p.id === paymentId) ?? currentPayment;

  const methodLabel = payment?.method === 'mpesa'
    ? 'M-Pesa'
    : payment?.method === 'airtel'
    ? 'Airtel Money'
    : payment?.method === 'orange'
    ? 'Orange Money'
    : 'Cash';

  const formattedDate = payment?.createdAt
    ? new Date(payment.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--';

  const getHtmlParams = useCallback(() => {
    if (!order) return null;
    return {
      orderId: order.id,
      date: formattedDate,
      clientName: user?.name ?? order.clientName,
      methodLabel,
      transactionRef: payment?.transactionRef,
      items: order.items.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
      })),
      subtotal: order.totalAmount.toLocaleString(),
      deliveryFee: order.deliveryFee.toLocaleString(),
      total: (order.totalAmount + order.deliveryFee).toLocaleString(),
    };
  }, [order, formattedDate, user, methodLabel, payment]);

  const handleDownloadPdf = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const params = getHtmlParams();
      if (!params) return;

      const html = buildReceiptHtml(params);

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });
      console.log('[Receipt] PDF saved to:', uri);
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Reçu ${order?.id ?? ''}`,
      });
    } catch (error) {
      console.log('[Receipt] Download error:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF. Veuillez réessayer.');
    }
  }, [getHtmlParams, order]);

  const handleShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const params = getHtmlParams();
      if (!params) return;

      const html = buildReceiptHtml(params);

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Partage indisponible', 'Le partage n\'est pas disponible sur cet appareil.');
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });
      console.log('[Receipt] Share PDF at:', uri);
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Reçu Kabi Delivery - ${order?.id ?? ''}`,
      });
    } catch (error) {
      console.log('[Receipt] Share error:', error);
      Alert.alert('Erreur', 'Impossible de partager le reçu. Veuillez réessayer.');
    }
  }, [getHtmlParams, order]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Reçu' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Commande introuvable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Reçu de paiement' }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View style={styles.receiptLogoCircle}>
              <FileText size={28} color={theme.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.receiptBrand}>Kabi Delivery</Text>
            <Text style={styles.receiptSubtitle}>Reçu de paiement</Text>
          </View>

          <View style={styles.receiptDivider}>
            <View style={styles.receiptDividerLine} />
            <View style={styles.receiptDividerCircleLeft} />
            <View style={styles.receiptDividerCircleRight} />
          </View>

          <View style={styles.receiptBody}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>N° Commande</Text>
              <Text style={styles.receiptValue}>{order.id}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date</Text>
              <Text style={styles.receiptValue}>{formattedDate}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Client</Text>
              <Text style={styles.receiptValue}>{user?.name ?? order.clientName}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Paiement</Text>
              <Text style={styles.receiptValue}>{methodLabel}</Text>
            </View>
            {payment?.transactionRef && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Réf. transaction</Text>
                <Text style={styles.receiptValueMono}>{payment.transactionRef}</Text>
              </View>
            )}
          </View>

          <View style={styles.receiptDivider}>
            <View style={styles.receiptDividerLine} />
            <View style={styles.receiptDividerCircleLeft} />
            <View style={styles.receiptDividerCircleRight} />
          </View>

          <View style={styles.receiptItems}>
            <Text style={styles.receiptItemsTitle}>Articles</Text>
            {order.items.map((item) => (
              <View key={item.product.id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>
                  {(item.product.price * item.quantity).toLocaleString()} FC
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.receiptDivider}>
            <View style={styles.receiptDividerLine} />
            <View style={styles.receiptDividerCircleLeft} />
            <View style={styles.receiptDividerCircleRight} />
          </View>

          <View style={styles.receiptTotals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <Text style={styles.totalValue}>{order.totalAmount.toLocaleString()} FC</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Frais de livraison</Text>
              <Text style={styles.totalValue}>{order.deliveryFee.toLocaleString()} FC</Text>
            </View>
            <View style={styles.totalSep} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Total payé</Text>
              <Text style={styles.grandTotalValue}>
                {(order.totalAmount + order.deliveryFee).toLocaleString()} FC
              </Text>
            </View>
          </View>

          <View style={styles.receiptFooter}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>PAYÉ</Text>
            </View>
            <Text style={styles.footerText}>Merci pour votre commande !</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadPdf}
            activeOpacity={0.85}
            testID="download-receipt"
          >
            <Download size={20} color="#FFF" strokeWidth={2.2} />
            <Text style={styles.downloadButtonText}>Télécharger PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.85}
            testID="share-receipt"
          >
            <Share2 size={20} color={theme.primary} strokeWidth={2.2} />
            <Text style={styles.shareButtonText}>Partager</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.replace('/(client-tabs)/orders' as any)}
            activeOpacity={0.9}
          >
            <Text style={styles.ordersButtonText}>Mes commandes</Text>
            <ChevronRight size={18} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/(client-tabs)/home' as any)}
            activeOpacity={0.85}
          >
            <Home size={16} color={theme.primary} strokeWidth={2} />
            <Text style={styles.homeButtonText}>Accueil</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  receiptCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  receiptHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  receiptLogoCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  receiptBrand: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.text,
    marginBottom: 4,
  },
  receiptSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  receiptDivider: {
    position: 'relative' as const,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  receiptDividerLine: {
    height: 1,
    backgroundColor: theme.divider,
    marginHorizontal: 20,
    borderStyle: 'dashed',
  },
  receiptDividerCircleLeft: {
    position: 'absolute',
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.bg,
  },
  receiptDividerCircleRight: {
    position: 'absolute',
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.bg,
  },
  receiptBody: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
  },
  receiptValueMono: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  receiptItems: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  receiptItemsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.text,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.primary,
    width: 28,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: theme.text,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.text,
  },
  receiptTotals: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.text,
  },
  totalSep: {
    height: 1,
    backgroundColor: theme.divider,
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: theme.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: theme.primary,
  },
  receiptFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 8,
  },
  statusBadge: {
    backgroundColor: theme.successLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: theme.success,
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primaryLight,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: theme.primary,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: theme.primary,
  },
  navActions: {
    marginTop: 20,
    gap: 10,
  },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  ordersButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.primary,
  },
});
