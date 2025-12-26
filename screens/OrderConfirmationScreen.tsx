import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type OrderConfirmationScreenRouteProp = RouteProp<RootStackParamList, 'OrderConfirmation'>;
type OrderConfirmationScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const OrderConfirmationScreen = () => {
  const route = useRoute<OrderConfirmationScreenRouteProp>();
  const navigation = useNavigation<OrderConfirmationScreenNavigationProp>();
  const { orderId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="check-circle" size={80} color="#2E7D32" />
        </View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Thank you for your purchase. Your order has been placed successfully.
        </Text>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Order ID</Text>
          <Text style={styles.orderId}>{orderId}</Text>
        </View>

        <Text style={styles.message}>
          You will receive a confirmation email shortly. We'll notify you when your order ships.
        </Text>

        <View style={styles.buttons}>
          <Button
            title="View Orders"
            onPress={() => {
              (navigation as any).navigate('Main');
              (navigation as any).navigate('Orders');
            }}
            style={styles.button}
          />
          <Button
            title="Continue Shopping"
            onPress={() => (navigation as any).navigate('Main')}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  orderInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
});

