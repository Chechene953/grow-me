import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PaymentForm } from '../components/PaymentForm';
import { ModernHeader } from '../components/ModernHeader';
import { PremiumPicker, COUNTRIES, getStatesForCountry } from '../components/PremiumPicker';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/orderService';
import { Address } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';

type PaymentMethod = 'card' | 'google_pay';

interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  available: boolean;
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'google_pay', label: 'Google Pay', iconName: 'google', available: Platform.OS === 'android' },
  { id: 'card', label: 'Credit Card', iconName: 'credit-card-outline', available: true },
];

export const CheckoutScreen = () => {
  const insets = useSafeAreaInsets();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();

  // Address state
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [country, setCountry] = useState(user?.address?.country || 'US');
  const [phone, setPhone] = useState('');

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);

  // Get states for selected country
  const stateOptions = useMemo(() => getStatesForCountry(country), [country]);

  // Calculate totals
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const discount = promoApplied ? promoDiscount : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (promoCode.toUpperCase() === 'PLANT20') {
        setPromoDiscount(subtotal * 0.2);
        setPromoApplied(true);
        Alert.alert('Promo Applied!', '20% discount has been applied to your order.');
      } else if (promoCode.toUpperCase() === 'FREESHIP') {
        setPromoDiscount(deliveryFee);
        setPromoApplied(true);
        Alert.alert('Promo Applied!', 'Free shipping has been applied to your order.');
      } else {
        Alert.alert('Invalid Code', 'This promo code is not valid or has expired.');
      }
      setPromoLoading(false);
    }, 1000);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    if (method !== 'card') {
      // Handle digital wallet payments
      handleDigitalWalletPayment(method);
    }
  };

  const handleDigitalWalletPayment = async (method: PaymentMethod) => {
    Alert.alert(
      'Google Pay',
      'Google Pay will be available in the production version.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedPaymentMethod('card') },
        {
          text: 'Continue',
          onPress: () => {
            setPaymentIntentId(`${method}_${Date.now()}`);
            setPaymentCompleted(true);
          }
        },
      ]
    );
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    setPaymentCompleted(true);
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Error', error);
  };

  const handlePlaceOrder = async () => {
    if (!street || !city || !zipCode) {
      Alert.alert('Error', 'Please fill in all required address fields');
      return;
    }

    if (stateOptions.length > 0 && !state) {
      Alert.alert('Error', 'Please select your state/province');
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
      const countryLabel = COUNTRIES.find(c => c.value === country)?.label || country;
      const address: Address = {
        street,
        city,
        state,
        zipCode,
        country: countryLabel,
      };

      const orderId = await orderService.createOrder({
        userId: user.id,
        items,
        subtotal,
        deliveryFee,
        total,
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

  const isAddressComplete = street && city && zipCode && (stateOptions.length === 0 || state);

  const availablePaymentMethods = PAYMENT_METHODS.filter(m => m.available);

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <ModernHeader title="Checkout" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: 220 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.progressDotActive}
            >
              <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Cart</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.progressDotActive}
            >
              <Text style={styles.progressDotTextActive}>2</Text>
            </LinearGradient>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Checkout</Text>
          </View>
          <View style={[styles.progressLine, paymentCompleted && styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, paymentCompleted && styles.progressDotCompleted]}>
              {paymentCompleted ? (
                <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />
              ) : (
                <Text style={styles.progressDotText}>3</Text>
              )}
            </View>
            <Text style={[styles.progressLabel, paymentCompleted && styles.progressLabelActive]}>Confirm</Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {items.map((item, index) => (
              <View key={index} style={styles.itemPreviewCard}>
                <Image source={{ uri: item.plant.images[0] }} style={styles.itemPreviewImage} />
                <Text style={styles.itemPreviewName} numberOfLines={1}>{item.plant.name}</Text>
                <Text style={styles.itemPreviewPrice}>${item.price.toFixed(2)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Delivery Address Section */}
        <View style={[styles.section, { backgroundColor: colors.neutral[0] }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary[50] }]}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.primary[600]} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Delivery Address</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.neutral[500] }]}>Where should we deliver your plants?</Text>
            </View>
          </View>

          <Input
            label="Street Address"
            placeholder="123 Plant Street, Apt 4B"
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
                label="Zip Code"
                placeholder="94102"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
                required
              />
            </View>
          </View>

          <PremiumPicker
            label="Country"
            placeholder="Select your country"
            value={country}
            options={COUNTRIES}
            onValueChange={(value) => {
              setCountry(value);
              setState(''); // Reset state when country changes
            }}
            searchable
            icon="earth"
          />

          {stateOptions.length > 0 && (
            <PremiumPicker
              label="State / Province"
              placeholder="Select your state"
              value={state}
              options={stateOptions}
              onValueChange={setState}
              searchable
              icon="map-outline"
            />
          )}

          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon="phone-outline"
          />
        </View>

        {/* Promo Code Section */}
        <View style={[styles.promoSection, { backgroundColor: colors.neutral[0] }]}>
          <View style={[styles.promoInputContainer, { backgroundColor: colors.neutral[50] }]}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={20} color={colors.neutral[400]} />
            <TextInput
              style={[styles.promoInput, { color: colors.neutral[900] }]}
              placeholder="Enter promo code"
              placeholderTextColor={colors.neutral[400]}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              editable={!promoApplied}
            />
            {promoApplied ? (
              <View style={styles.promoAppliedBadge}>
                <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />
                <Text style={styles.promoAppliedText}>Applied</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.promoButton, !promoCode.trim() && styles.promoButtonDisabled]}
                onPress={handleApplyPromo}
                disabled={!promoCode.trim() || promoLoading}
              >
                <Text style={styles.promoButtonText}>
                  {promoLoading ? 'Applying...' : 'Apply'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.promoHint, { color: colors.neutral[400] }]}>Try "PLANT20" for 20% off or "FREESHIP" for free shipping</Text>
        </View>

        {/* Order Summary Section */}
        <View style={[styles.section, { backgroundColor: colors.neutral[0] }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary[50] }]}>
              <MaterialCommunityIcons name="receipt" size={20} color={colors.primary[600]} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Order Summary</Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.neutral[500] }]}>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</Text>
              <Text style={[styles.summaryValue, { color: colors.neutral[800] }]}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.deliveryRow}>
                <Text style={[styles.summaryLabel, { color: colors.neutral[500] }]}>Delivery</Text>
                {deliveryFee === 0 && (
                  <View style={styles.freeTag}>
                    <Text style={styles.freeTagText}>FREE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.summaryValue, { color: colors.neutral[800] }, deliveryFee === 0 && { color: colors.semantic.success }]}>
                {deliveryFee === 0 ? '$0.00' : `$${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            {promoApplied && (
              <View style={styles.summaryRow}>
                <View style={styles.discountRow}>
                  <MaterialCommunityIcons name="tag-outline" size={16} color={colors.semantic.success} />
                  <Text style={[styles.discountLabel, { color: colors.semantic.success }]}>Promo Discount</Text>
                </View>
                <Text style={[styles.discountValue, { color: colors.semantic.success }]}>-${discount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.divider, { backgroundColor: colors.neutral[200] }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryTotalLabel, { color: colors.neutral[900] }]}>Total</Text>
              <Text style={[styles.summaryTotalValue, { color: colors.primary[700] }]}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View style={[styles.section, { backgroundColor: colors.neutral[0] }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary[50] }]}>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={colors.primary[600]} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Payment Method</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.neutral[500] }]}>All transactions are secure and encrypted</Text>
            </View>
          </View>

          {paymentCompleted ? (
            <View style={styles.paymentSuccess}>
              <LinearGradient
                colors={[colors.semantic.success, '#45a049']}
                style={styles.paymentSuccessIcon}
              >
                <MaterialCommunityIcons name="check" size={32} color={colors.neutral[0]} />
              </LinearGradient>
              <Text style={styles.paymentSuccessText}>Payment Successful!</Text>
              <Text style={styles.paymentSuccessSubtext}>
                {selectedPaymentMethod === 'card' ? 'Card ending in ****' : selectedPaymentMethod.replace('_', ' ').toUpperCase()}
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

              {/* Payment Method Selection */}
              <View style={styles.paymentMethods}>
                {availablePaymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodCard,
                      { backgroundColor: colors.neutral[50], borderColor: colors.neutral[200] },
                      selectedPaymentMethod === method.id && { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
                    ]}
                    onPress={() => handlePaymentMethodSelect(method.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={method.iconName}
                      size={24}
                      color={selectedPaymentMethod === method.id ? colors.primary[600] : colors.neutral[500]}
                    />
                    <Text style={[
                      styles.paymentMethodLabel,
                      { color: colors.neutral[600] },
                      selectedPaymentMethod === method.id && { color: colors.primary[700] },
                    ]}>
                      {method.label}
                    </Text>
                    {selectedPaymentMethod === method.id && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={colors.primary[600]}
                        style={styles.paymentMethodCheck}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Card Payment Form */}
              {selectedPaymentMethod === 'card' && (
                <View style={styles.cardFormContainer}>
                  <PaymentForm
                    amount={total}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </View>
              )}

              {/* Security Badge */}
              <View style={styles.securityBadge}>
                <MaterialCommunityIcons name="shield-check" size={16} color={colors.semantic.success} />
                <Text style={[styles.securityText, { color: colors.neutral[500] }]}>
                  Secured by Stripe. Your payment info is encrypted.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <BlurView intensity={90} tint="light" style={[styles.footer, { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.md), borderTopColor: colors.neutral[200] }]}>
        <View style={styles.footerContent}>
          <View style={styles.footerTotal}>
            <View>
              <Text style={[styles.footerTotalLabel, { color: colors.neutral[500] }]}>Total</Text>
              {promoApplied && (
                <Text style={[styles.footerSavings, { color: colors.semantic.success }]}>You save ${discount.toFixed(2)}</Text>
              )}
            </View>
            <Text style={[styles.footerTotalValue, { color: colors.primary[700] }]}>${total.toFixed(2)}</Text>
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
    backgroundColor: defaultColors.neutral[100],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: defaultColors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressDotActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressDotCompleted: {
    backgroundColor: defaultColors.primary[600],
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: defaultColors.neutral[400],
  },
  progressDotTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: defaultColors.neutral[0],
  },
  progressLabel: {
    ...typography.caption,
    color: defaultColors.neutral[400],
  },
  progressLabelActive: {
    color: defaultColors.primary[600],
    fontWeight: '600',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: defaultColors.neutral[200],
    marginHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressLineActive: {
    backgroundColor: defaultColors.primary[600],
  },
  itemsPreview: {
    marginBottom: spacing.lg,
  },
  itemPreviewCard: {
    width: 80,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  itemPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: defaultColors.neutral[100],
  },
  itemPreviewName: {
    ...typography.caption,
    color: defaultColors.neutral[700],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  itemPreviewPrice: {
    ...typography.caption,
    fontWeight: '600',
    color: defaultColors.primary[600],
  },
  section: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: defaultColors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.title3,
    color: defaultColors.neutral[900],
  },
  sectionSubtitle: {
    ...typography.caption,
    color: defaultColors.neutral[500],
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  promoSection: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultColors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  promoInput: {
    flex: 1,
    ...typography.body,
    color: defaultColors.neutral[900],
    paddingVertical: spacing.md,
  },
  promoButton: {
    backgroundColor: defaultColors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  promoButtonDisabled: {
    backgroundColor: defaultColors.neutral[300],
  },
  promoButtonText: {
    ...typography.footnote,
    fontWeight: '600',
    color: defaultColors.neutral[0],
  },
  promoAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultColors.semantic.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  promoAppliedText: {
    ...typography.caption,
    fontWeight: '600',
    color: defaultColors.neutral[0],
  },
  promoHint: {
    ...typography.caption,
    color: defaultColors.neutral[400],
    marginTop: spacing.sm,
    textAlign: 'center',
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
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: defaultColors.neutral[500],
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
    color: defaultColors.neutral[800],
  },
  freeValue: {
    color: defaultColors.semantic.success,
  },
  discountLabel: {
    ...typography.body,
    color: defaultColors.semantic.success,
  },
  discountValue: {
    ...typography.body,
    fontWeight: '600',
    color: defaultColors.semantic.success,
  },
  freeTag: {
    backgroundColor: defaultColors.semantic.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  freeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: defaultColors.neutral[0],
  },
  divider: {
    height: 1,
    backgroundColor: defaultColors.neutral[200],
    marginVertical: spacing.md,
  },
  summaryTotalLabel: {
    ...typography.title3,
    color: defaultColors.neutral[900],
  },
  summaryTotalValue: {
    ...typography.title2,
    color: defaultColors.primary[700],
  },
  addressWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${defaultColors.accent.gold}15`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  addressWarningText: {
    ...typography.footnote,
    color: defaultColors.neutral[700],
    flex: 1,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  paymentMethodCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultColors.neutral[50],
    borderWidth: 1.5,
    borderColor: defaultColors.neutral[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  paymentMethodCardSelected: {
    borderColor: defaultColors.primary[600],
    backgroundColor: defaultColors.primary[50],
  },
  paymentMethodIcon: {
    width: 32,
    height: 20,
  },
  paymentMethodLabel: {
    ...typography.footnote,
    fontWeight: '500',
    color: defaultColors.neutral[600],
    flex: 1,
  },
  paymentMethodLabelSelected: {
    color: defaultColors.primary[700],
    fontWeight: '600',
  },
  paymentMethodCheck: {
    marginLeft: 'auto',
  },
  cardFormContainer: {
    marginTop: spacing.sm,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  securityText: {
    ...typography.caption,
    color: defaultColors.neutral[500],
  },
  paymentSuccess: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: defaultColors.primary[50],
    borderRadius: borderRadius.xl,
  },
  paymentSuccessIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentSuccessText: {
    ...typography.title3,
    color: defaultColors.primary[700],
    marginBottom: spacing.xs,
  },
  paymentSuccessSubtext: {
    ...typography.footnote,
    color: defaultColors.neutral[500],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: defaultColors.neutral[200],
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
    color: defaultColors.neutral[500],
  },
  footerSavings: {
    ...typography.caption,
    color: defaultColors.semantic.success,
    fontWeight: '500',
  },
  footerTotalValue: {
    ...typography.title1,
    color: defaultColors.primary[700],
  },
});
