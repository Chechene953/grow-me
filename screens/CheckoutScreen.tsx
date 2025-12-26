import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PaymentForm } from '../components/PaymentForm';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/orderService';
import { Address } from '../types';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const CheckoutScreen = () => {
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<CheckoutScreenNavigationProp>();

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
    // Automatically place order after successful payment
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
      (navigation as any).navigate('OrderConfirmation', { orderId });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Input
          label="Street Address"
          placeholder="Enter street address"
          value={street}
          onChangeText={setStreet}
          icon="map-marker-outline"
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="City"
              placeholder="Enter city"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={styles.half}>
            <Input
              label="State"
              placeholder="Enter state"
              value={state}
              onChangeText={setState}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="Zip Code"
              placeholder="Enter zip code"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Country"
              placeholder="Enter country"
              value={country}
              onChangeText={setCountry}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${getSubtotal().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {getDeliveryFee() === 0 ? 'Free' : `$${getDeliveryFee().toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${getTotal().toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        {paymentCompleted ? (
          <View style={styles.paymentSuccess}>
            <MaterialCommunityIcons name="check-circle" size={48} color="#2E7D32" />
            <Text style={styles.paymentSuccessText}>Payment Successful!</Text>
            <Text style={styles.paymentSuccessSubtext}>
              Payment ID: {paymentIntentId?.substring(0, 20)}...
            </Text>
          </View>
        ) : (
          <PaymentForm
            amount={getTotal()}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        )}
      </View>

      {paymentCompleted && (
        <Button
          title={loading ? 'Placing Order...' : 'Place Order'}
          onPress={handlePlaceOrder}
          loading={loading}
          style={styles.orderButton}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  summary: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  paymentSuccess: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  paymentSuccessText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 12,
  },
  paymentSuccessSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  orderButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

