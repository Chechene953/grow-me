import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PaymentForm } from '../components/PaymentForm';
import { ModernHeader } from '../components/ModernHeader';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/orderService';
import { Address } from '../types';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

export const CheckoutScreen = () => {
  const insets = useSafeAreaInsets();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [country, setCountry] = useState(user?.address?.country || 'United States');
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    setPaymentCompleted(true);
    await handlePlaceOrder();
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Error', error);
  };

  const handlePlaceOrder = async () => {
    if (!street || !city || !state || !zipCode) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }

    if (!paymentCompleted) {
      Alert.alert('Error', 'Please complete payment first');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to place an order');
      return;
    }

    setLoading(true);

    try {
      const address: Address = {
        street,
        city,
        state,
        zipCode,
        country,
      };

      const orderId = await orderService.createOrder({
        userId: user.id,
        items,
        subtotal: getSubtotal(),
        deliveryFee: getDeliveryFee(),
        total: getTotal(),
        status: 'Processing',
        address,
      });

      clearCart();
      router.replace(`/order-confirmation/${orderId}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const isAddressComplete = street && city && state && zipCode;

  return (
    <View style={styles.container}>
      <ModernHeader title="Checkout" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: 200, paddingTop: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]}>
              <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Cart</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]}>
              <Text style={styles.progressDotText}>2</Text>
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Checkout</Text>
          </View>
          <View style={[styles.progressLine, paymentCompleted && styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, paymentCompleted && styles.progressDotActive]}>
              <Text style={[styles.progressDotText, paymentCompleted && styles.progressDotTextActive]}>3</Text>
            </View>
            <Text style={[styles.progressLabel, paymentCompleted && styles.progressLabelActive]}>Confirm</Text>
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.primary[600]} />
            </View>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <Input
            label="Street Address"
            placeholder="123 Plant Street"
            value={street}
            onChangeText={setStreet}
            icon="home-outline"
            required
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="City"
                placeholder="San Francisco"
                value={city}
                onChangeText={setCity}
                required
              />
            </View>
            <View style={styles.half}>
              <Input
                label="State"
                placeholder="CA"
                value={state}
                onChangeText={setState}
                required
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Zip Code"
                placeholder="94102"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
                required
              />
            </View>
            <View style={styles.half}>
              <Input
                label="Country"
                placeholder="United States"
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons name="receipt" size={20} color={colors.primary[600]} />
            </View>
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
              <Text style={styles.summaryValue}>${getSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.deliveryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                {getDeliveryFee() === 0 && (
                  <View style={styles.freeTag}>
                    <Text style={styles.freeTagText}>FREE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.summaryValue, getDeliveryFee() === 0 && styles.freeValue]}>
                {getDeliveryFee() === 0 ? '$0.00' : `$${getDeliveryFee().toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>${getTotal().toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={colors.primary[600]} />
            </View>
            <Text style={styles.sectionTitle}>Payment</Text>
          </View>
          {paymentCompleted ? (
            <View style={styles.paymentSuccess}>
              <View style={styles.paymentSuccessIcon}>
                <MaterialCommunityIcons name="check" size={32} color={colors.neutral[0]} />
              </View>
              <Text style={styles.paymentSuccessText}>Payment Successful!</Text>
              <Text style={styles.paymentSuccessSubtext}>
                ID: {paymentIntentId?.substring(0, 24)}...
              </Text>
            </View>
          ) : (
            <>
              {!isAddressComplete && (
                <View style={styles.addressWarning}>
                  <MaterialCommunityIcons name="information-outline" size={18} color={colors.accent.gold} />
                  <Text style={styles.addressWarningText}>
                    Please complete your delivery address first
                  </Text>
                </View>
              )}
              <PaymentForm
                amount={getTotal()}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <BlurView intensity={90} tint="light" style={[styles.footer, { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.md) }]}>
        <View style={styles.footerContent}>
          <View style={styles.footerTotal}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>${getTotal().toFixed(2)}</Text>
          </View>
          {paymentCompleted && (
            <Button
              title={loading ? 'Placing Order...' : 'Place Order'}
              onPress={handlePlaceOrder}
              loading={loading}
              icon="check-circle-outline"
              size="large"
              fullWidth
            />
          )}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressDotActive: {
    backgroundColor: colors.primary[600],
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[400],
  },
  progressDotTextActive: {
    color: colors.neutral[0],
  },
  progressLabel: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  progressLabelActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  progressLine: {
    width: 48,
    height: 2,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressLineActive: {
    backgroundColor: colors.primary[600],
  },
  section: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.neutral[900],
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  summary: {
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.neutral[500],
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  freeValue: {
    color: colors.semantic.success,
  },
  freeTag: {
    backgroundColor: colors.semantic.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  freeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.md,
  },
  summaryTotalLabel: {
    ...typography.title3,
    color: colors.neutral[900],
  },
  summaryTotalValue: {
    ...typography.title2,
    color: colors.primary[700],
  },
  addressWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent.gold}15`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  addressWarningText: {
    ...typography.footnote,
    color: colors.neutral[700],
    flex: 1,
  },
  paymentSuccess: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
  },
  paymentSuccessIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.semantic.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentSuccessText: {
    ...typography.title3,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  paymentSuccessSubtext: {
    ...typography.caption,
    color: colors.neutral[500],
    fontFamily: 'monospace',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    ...shadows.lg,
  },
  footerContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  footerTotalLabel: {
    ...typography.body,
    color: colors.neutral[500],
  },
  footerTotalValue: {
    ...typography.title2,
    color: colors.primary[700],
  },
});
