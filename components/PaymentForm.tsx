import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { paymentService } from '../services/paymentService';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

// Card brand icons using MaterialCommunityIcons
const CARD_BRAND_ICONS: Record<string, { icon: string; color: string }> = {
  visa: { icon: 'credit-card', color: '#1A1F71' },
  mastercard: { icon: 'credit-card', color: '#EB001B' },
  amex: { icon: 'credit-card', color: '#006FCF' },
  discover: { icon: 'credit-card', color: '#FF6000' },
  unknown: { icon: 'credit-card-outline', color: colors.neutral[400] },
};

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardBrand, setCardBrand] = useState<string>('unknown');
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    const config = paymentService.getStripeConfig();
    setIsSandbox(config.sandboxMode);
  }, []);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    setCardBrand(paymentService.getCardBrand(text));
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber || !paymentService.validateCardNumber(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!expiryMonth || !expiryYear || !paymentService.validateExpiryDate(expiryMonth, expiryYear)) {
      newErrors.expiry = 'Please enter a valid expiry date';
    }

    if (!cvv || !paymentService.validateCVV(cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const paymentResult = await paymentService.processPayment(
        'card_' + Date.now(), // Mock payment method ID
        amount,
        'usd'
      );

      if (paymentResult.success && paymentResult.paymentIntentId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPaymentSuccess(paymentResult.paymentIntentId);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onPaymentError(paymentResult.error || 'Payment failed');
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onPaymentError(error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isSandbox && (
        <View style={styles.sandboxBanner}>
          <MaterialCommunityIcons name="test-tube" size={16} color={colors.accent.gold} />
          <Text style={styles.sandboxText}>Test Mode - Use card 4242 4242 4242 4242</Text>
        </View>
      )}

      <View style={styles.card}>
        {/* Card Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card Number</Text>
          <View style={[styles.inputContainer, errors.cardNumber && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
              placeholderTextColor={colors.neutral[400]}
            />
            <MaterialCommunityIcons
              name={(CARD_BRAND_ICONS[cardBrand]?.icon || 'credit-card-outline') as any}
              size={24}
              color={CARD_BRAND_ICONS[cardBrand]?.color || colors.neutral[400]}
            />
          </View>
          {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
        </View>

        {/* Cardholder Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cardholder Name</Text>
          <View style={[styles.inputContainer, errors.cardholderName && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={cardholderName}
              onChangeText={(text) => {
                setCardholderName(text);
                if (errors.cardholderName) {
                  setErrors({ ...errors, cardholderName: '' });
                }
              }}
              autoCapitalize="words"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>
          {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
        </View>

        {/* Expiry and CVV */}
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Expiry Date</Text>
            <View style={styles.expiryRow}>
              <View style={[styles.inputContainer, styles.expiryInput, errors.expiry && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.centerText]}
                  placeholder="MM"
                  value={expiryMonth}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '');
                    setExpiryMonth(cleaned.slice(0, 2));
                    if (errors.expiry) {
                      setErrors({ ...errors, expiry: '' });
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
              <Text style={styles.expirySeparator}>/</Text>
              <View style={[styles.inputContainer, styles.expiryInput, errors.expiry && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.centerText]}
                  placeholder="YY"
                  value={expiryYear}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '');
                    setExpiryYear(cleaned.slice(0, 2));
                    if (errors.expiry) {
                      setErrors({ ...errors, expiry: '' });
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
            </View>
            {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>CVV</Text>
            <View style={[styles.inputContainer, errors.cvv && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '');
                  setCvv(cleaned.slice(0, 4));
                  if (errors.cvv) {
                    setErrors({ ...errors, cvv: '' });
                  }
                }}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholderTextColor={colors.neutral[400]}
              />
              <MaterialCommunityIcons name="help-circle-outline" size={20} color={colors.neutral[400]} />
            </View>
            {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
          </View>
        </View>
      </View>

      {/* Pay Button */}
      <TouchableOpacity
        style={styles.payButtonContainer}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={loading ? [colors.neutral[400], colors.neutral[500]] : [colors.primary[500], colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.payButton}
        >
          {loading ? (
            <>
              <MaterialCommunityIcons name="loading" size={20} color={colors.neutral[0]} />
              <Text style={styles.payButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="lock" size={20} color={colors.neutral[0]} />
              <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <MaterialCommunityIcons name="shield-check" size={14} color={colors.semantic.success} />
        <Text style={styles.securityText}>
          Secured by 256-bit SSL encryption
        </Text>
      </View>

      {/* Accepted Cards */}
      <View style={styles.acceptedCards}>
        <Text style={styles.acceptedLabel}>We accept</Text>
        <View style={styles.cardLogos}>
          <View style={styles.cardLogoPlaceholder}>
            <MaterialCommunityIcons name="credit-card" size={20} color={colors.neutral[600]} />
          </View>
          <View style={styles.cardLogoPlaceholder}>
            <Text style={styles.cardLogoText}>VISA</Text>
          </View>
          <View style={styles.cardLogoPlaceholder}>
            <Text style={styles.cardLogoText}>MC</Text>
          </View>
          <View style={styles.cardLogoPlaceholder}>
            <Text style={styles.cardLogoText}>AMEX</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  sandboxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.gold + '15',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  sandboxText: {
    ...typography.caption,
    color: colors.accent.gold,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  inputError: {
    borderColor: colors.semantic.error,
    backgroundColor: `${colors.semantic.error}08`,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
  },
  centerText: {
    textAlign: 'center',
  },
  errorText: {
    ...typography.caption,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expiryInput: {
    flex: 1,
    justifyContent: 'center',
  },
  expirySeparator: {
    ...typography.title3,
    color: colors.neutral[400],
  },
  payButtonContainer: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  payButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.neutral[0],
    fontSize: 17,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  securityText: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  acceptedCards: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  acceptedLabel: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  cardLogos: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardLogoPlaceholder: {
    width: 36,
    height: 24,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogoText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.neutral[600],
  },
});
