import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '../components/Button';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../stores/authStore';
import { Order } from '../types';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export const OrderConfirmationScreen = () => {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { colors } = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation values using React Native's Animated API
  const checkScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadOrder();
    // Trigger animations
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const loadOrder = async () => {
    if (!orderId) return;
    try {
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  const handleViewOrders = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/orders');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.neutral[50] }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <Animated.View style={[styles.successContainer, { transform: [{ scale: checkScale }] }]}>
          <LinearGradient
            colors={[colors.semantic.success, '#45a049']}
            style={styles.successCircle}
          >
            <MaterialCommunityIcons name="check" size={56} color={defaultColors.neutral[0]} />
          </LinearGradient>
        </Animated.View>

        {/* Success Message */}
        <Text style={[styles.title, { color: colors.neutral[900] }]}>Order Confirmed!</Text>
        <Text style={[styles.subtitle, { color: colors.neutral[600] }]}>
          Thank you for your purchase. Your order has been placed successfully.
        </Text>

        {/* Order Number */}
        <Animated.View style={[styles.orderNumberCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], backgroundColor: colors.primary[50] }]}>
          <Text style={[styles.orderNumberLabel, { color: colors.primary[600] }]}>Order Number</Text>
          <Text style={[styles.orderNumber, { color: colors.primary[700] }]}>#{orderId?.slice(-8).toUpperCase()}</Text>
        </Animated.View>

        {/* Email Notification */}
        <Animated.View style={[styles.infoCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], backgroundColor: colors.neutral[0] }]}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.primary[50] }]}>
            <MaterialCommunityIcons name="email-check-outline" size={28} color={colors.primary[600]} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.neutral[900] }]}>Confirmation Email Sent</Text>
            <Text style={[styles.infoText, { color: colors.neutral[600] }]}>
              We've sent a confirmation email to{' '}
              <Text style={[styles.infoEmail, { color: colors.primary[600] }]}>{user?.email || 'your email'}</Text> with your order details and receipt.
            </Text>
          </View>
        </Animated.View>

        {/* Tracking Info */}
        <Animated.View style={[styles.infoCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], backgroundColor: colors.neutral[0] }]}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.accent.gold + '20' }]}>
            <MaterialCommunityIcons name="truck-fast-outline" size={28} color={colors.accent.gold} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.neutral[900] }]}>Track Your Order</Text>
            <Text style={[styles.infoText, { color: colors.neutral[600] }]}>
              You can track your order status anytime from the "My Orders" section in your profile.
            </Text>
          </View>
        </Animated.View>

        {/* Order Summary */}
        {order && (
          <Animated.View style={[styles.summaryCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], backgroundColor: colors.neutral[0] }]}>
            <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Order Summary</Text>

            {/* Items */}
            <View style={styles.itemsList}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Image source={{ uri: item.plant.images[0] }} style={[styles.itemImage, { backgroundColor: colors.neutral[100] }]} />
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: colors.neutral[900] }]}>{item.plant.name}</Text>
                    <Text style={[styles.itemMeta, { color: colors.neutral[500] }]}>
                      {item.size} / {item.potColor.name} / Qty: {item.quantity}
                    </Text>
                  </View>
                  <Text style={[styles.itemPrice, { color: colors.neutral[800] }]}>${item.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.neutral[200] }]} />

            {/* Totals */}
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.neutral[600] }]}>Subtotal</Text>
                <Text style={[styles.totalValue, { color: colors.neutral[800] }]}>${order.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.neutral[600] }]}>Delivery</Text>
                <Text style={[styles.totalValue, { color: colors.neutral[800] }, order.deliveryFee === 0 && { color: colors.semantic.success }]}>
                  {order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee.toFixed(2)}`}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.neutral[200] }]} />
              <View style={styles.totalRow}>
                <Text style={[styles.grandTotalLabel, { color: colors.neutral[900] }]}>Total</Text>
                <Text style={[styles.grandTotalValue, { color: colors.primary[700] }]}>${order.total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Shipping Address */}
            <View style={[styles.addressContainer, { borderTopColor: colors.neutral[100] }]}>
              <Text style={[styles.addressTitle, { color: colors.neutral[600] }]}>Shipping To</Text>
              <Text style={[styles.addressText, { color: colors.neutral[800] }]}>
                {order.address.street}{'\n'}
                {order.address.city}, {order.address.state} {order.address.zipCode}{'\n'}
                {order.address.country}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Estimated Delivery */}
        <Animated.View style={[styles.deliveryCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }], backgroundColor: colors.primary[50] }]}>
          <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primary[600]} />
          <View style={styles.deliveryContent}>
            <Text style={[styles.deliveryTitle, { color: colors.primary[600] }]}>Estimated Delivery</Text>
            <Text style={[styles.deliveryDate, { color: colors.primary[800] }]}>
              {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title="View My Orders"
            onPress={handleViewOrders}
            icon="package-variant"
            size="large"
            fullWidth
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueShopping}>
            <MaterialCommunityIcons name="shopping" size={20} color={colors.primary[600]} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary[600] }]}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultColors.neutral[50],
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },

  // Success Animation
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },

  // Title
  title: {
    ...typography.largeTitle,
    color: defaultColors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: defaultColors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },

  // Order Number Card
  orderNumberCard: {
    backgroundColor: defaultColors.primary[50],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  orderNumberLabel: {
    ...typography.footnote,
    color: defaultColors.primary[600],
    marginBottom: spacing.xs,
  },
  orderNumber: {
    ...typography.title1,
    color: defaultColors.primary[700],
    fontWeight: '700',
  },

  // Info Cards
  infoCard: {
    flexDirection: 'row',
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  infoIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: defaultColors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: defaultColors.neutral[900],
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.footnote,
    color: defaultColors.neutral[600],
    lineHeight: 20,
  },
  infoEmail: {
    fontWeight: '600',
    color: defaultColors.primary[600],
  },

  // Summary Card
  summaryCard: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.title3,
    color: defaultColors.neutral[900],
    marginBottom: spacing.md,
  },
  itemsList: {
    gap: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: defaultColors.neutral[100],
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    ...typography.callout,
    fontWeight: '600',
    color: defaultColors.neutral[900],
  },
  itemMeta: {
    ...typography.caption,
    color: defaultColors.neutral[500],
    marginTop: 2,
  },
  itemPrice: {
    ...typography.callout,
    fontWeight: '600',
    color: defaultColors.neutral[800],
  },
  divider: {
    height: 1,
    backgroundColor: defaultColors.neutral[200],
    marginVertical: spacing.md,
  },
  totalsContainer: {
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.body,
    color: defaultColors.neutral[600],
  },
  totalValue: {
    ...typography.body,
    fontWeight: '500',
    color: defaultColors.neutral[800],
  },
  freeText: {
    color: defaultColors.semantic.success,
  },
  grandTotalLabel: {
    ...typography.title3,
    color: defaultColors.neutral[900],
  },
  grandTotalValue: {
    ...typography.title2,
    color: defaultColors.primary[700],
    fontWeight: '700',
  },
  addressContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: defaultColors.neutral[100],
  },
  addressTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: defaultColors.neutral[600],
    marginBottom: spacing.xs,
  },
  addressText: {
    ...typography.body,
    color: defaultColors.neutral[800],
    lineHeight: 22,
  },

  // Delivery Card
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultColors.primary[50],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: defaultColors.primary[600],
    marginBottom: 2,
  },
  deliveryDate: {
    ...typography.body,
    fontWeight: '600',
    color: defaultColors.primary[800],
  },

  // Buttons
  buttonsContainer: {
    gap: spacing.md,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: defaultColors.primary[600],
  },
});
