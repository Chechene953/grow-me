import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';
import { ENV } from '../utils/env';
import { DemoPaymentForm } from './DemoPaymentForm';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only import Stripe if not in Expo Go
let CardForm: any = null;
let useConfirmPayment: any = null;
let useStripe: any = null;

if (!isExpoGo) {
  try {
    const stripe = require('@stripe/stripe-react-native');
    CardForm = stripe.CardForm;
    useConfirmPayment = stripe.useConfirmPayment;
    useStripe = stripe.useStripe;
  } catch (e) {
    console.log('Stripe native module not available');
  }
}

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  // If in Expo Go, use the demo form
  if (isExpoGo || !CardForm) {
    return (
      <DemoPaymentForm
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    );
  }

  // Native Stripe implementation for production builds
  return (
    <NativePaymentForm
      amount={amount}
      onPaymentSuccess={onPaymentSuccess}
      onPaymentError={onPaymentError}
    />
  );
};

// Native Stripe payment form for production builds
const NativePaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [cardComplete, setCardComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();
  const stripe = useStripe();
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // Check if using test key
    const pubKey = ENV.STRIPE_PUBLISHABLE_KEY;
    setIsTestMode(pubKey.startsWith('pk_test_'));
  }, []);

  const handleSubmit = async () => {
    if (!cardComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    if (!ENV.STRIPE_BACKEND_URL) {
      // Demo mode - simulate payment
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPaymentSuccess(`demo_${Date.now()}`);
      }, 1500);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      // Create PaymentIntent on your backend
      const response = await fetch(`${ENV.STRIPE_BACKEND_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm the payment
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onPaymentError(error.message);
      } else if (paymentIntent) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPaymentSuccess(paymentIntent.id);
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
      {isTestMode && (
        <View style={styles.testModeBanner}>
          <MaterialCommunityIcons name="test-tube" size={16} color={colors.accent.gold} />
          <Text style={styles.testModeText}>Test Mode - Use card 4242 4242 4242 4242</Text>
        </View>
      )}


      <View style={styles.card}>
        <Text style={styles.label}>Card Details</Text>
        <CardForm
          cardStyle={{
            backgroundColor: colors.neutral[50],
            textColor: colors.neutral[900],
            borderColor: colors.neutral[200],
            borderWidth: 1,
            borderRadius: 12,
            fontSize: 16,
            placeholderColor: colors.neutral[400],
            cursorColor: colors.primary[600],
          }}
          style={styles.cardForm}
          onFormComplete={(details: any) => {
            console.log('CardForm details:', JSON.stringify(details, null, 2));
            setCardDetails(details);
            setCardComplete(details.complete);
          }}
        />
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
              <ActivityIndicator size="small" color={colors.neutral[0]} />
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
          Secured by Stripe with 256-bit SSL encryption
        </Text>
      </View>

      {/* Accepted Cards */}
      <View style={styles.acceptedCards}>
        <Text style={styles.acceptedLabel}>We accept</Text>
        <View style={styles.cardLogos}>
          <View style={styles.cardLogoPlaceholder}>
            <Text style={styles.cardLogoText}>VISA</Text>
          </View>
          <View style={styles.cardLogoPlaceholder}>
            <Text style={styles.cardLogoText}>MC</Text>
          </View>
          <View style={styles.cardLogoPlaceholder}>
            <Text style={styles.cardLogoText}>AMEX</Text>
          </View>
          <View style={styles.cardLogoPlaceholder}>
            <Text style={styles.cardLogoText}>DISC</Text>
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
  testModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.gold + '15',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  testModeText: {
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
  label: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  cardForm: {
    width: '100%',
    height: 220,
    marginVertical: spacing.xs,
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
