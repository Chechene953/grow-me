import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { paymentService } from '../services/paymentService';

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
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
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
      return;
    }

    setLoading(true);
    try {
      const paymentResult = await paymentService.processPayment(
        'card_' + Date.now(), // Mock payment method ID
        amount,
        'usd'
      );

      if (paymentResult.success && paymentResult.paymentIntentId) {
        onPaymentSuccess(paymentResult.paymentIntentId);
      } else {
        onPaymentError(paymentResult.error || 'Payment failed');
      }
    } catch (error: any) {
      onPaymentError(error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="credit-card" size={24} color="#2E7D32" />
          <Text style={styles.cardTitle}>Payment Information</Text>
        </View>

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
              placeholderTextColor="#999"
            />
            <MaterialCommunityIcons name="credit-card-outline" size={20} color="#666" />
          </View>
          {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
        </View>

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
              placeholderTextColor="#999"
            />
          </View>
          {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Expiry Date</Text>
            <View style={styles.expiryRow}>
              <View style={[styles.inputContainer, styles.expiryInput, errors.expiry && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="MM"
                  value={expiryMonth}
                  onChangeText={(text) => {
                    setExpiryMonth(text.slice(0, 2));
                    if (errors.expiry) {
                      setErrors({ ...errors, expiry: '' });
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.expirySeparator}>/</Text>
              <View style={[styles.inputContainer, styles.expiryInput, errors.expiry && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="YY"
                  value={expiryYear}
                  onChangeText={(text) => {
                    setExpiryYear(text.slice(0, 2));
                    if (errors.expiry) {
                      setErrors({ ...errors, expiry: '' });
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#999"
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
                  setCvv(text.slice(0, 4));
                  if (errors.cvv) {
                    setErrors({ ...errors, cvv: '' });
                  }
                }}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>
            {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
          </View>
        </View>

        <View style={styles.securityNote}>
          <MaterialCommunityIcons name="shield-check" size={16} color="#2E7D32" />
          <Text style={styles.securityText}>Your payment is secured by Stripe</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <Text style={styles.payButtonText}>Processing...</Text>
        ) : (
          <>
            <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
            <MaterialCommunityIcons name="lock" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#FFEBEE',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiryInput: {
    flex: 1,
  },
  expirySeparator: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});


