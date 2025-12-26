import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CartItem } from '../components/CartItem';
import { Button } from '../components/Button';
import { useCartStore } from '../stores/cartStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const CartScreen = () => {
  const insets = useSafeAreaInsets();
  const { items, removeItem, updateQuantity, getSubtotal, getDeliveryFee, getTotal } = useCartStore();
  const navigation = useNavigation<CartScreenNavigationProp>();

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    (navigation as any).navigate('Checkout');
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-off" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Start adding plants to your cart</Text>
        <Button
          title="Browse Plants"
          onPress={() => (navigation as any).navigate('Main')}
          style={styles.browseButton}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + 140 }] }>
        {items.map((item, index) => (
          <CartItem
            key={`${item.plantId}-${item.size}-${item.potColor.name}-${index}`}
            item={item}
            onRemove={() => removeItem(item.plantId, item.size, item.potColor.name)}
            onUpdateQuantity={(quantity) =>
              updateQuantity(item.plantId, item.size, item.potColor.name, quantity)
            }
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom + 12) }]}>
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

        <Button
          title={`Proceed to Checkout (${items.length} items)`}
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  summary: {
    marginBottom: 16,
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
  checkoutButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 32,
  },
  browseButton: {
    minWidth: 200,
  },
});

