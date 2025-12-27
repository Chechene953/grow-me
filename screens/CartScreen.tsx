import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CartItem } from '../components/CartItem';
import { Button } from '../components/Button';
import { useCartStore } from '../stores/cartStore';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Tab bar height + bottom padding
const TAB_BAR_HEIGHT = 90;

export const CartScreen = () => {
  const insets = useSafeAreaInsets();
  const { items, removeItem, updateQuantity, getSubtotal, getDeliveryFee, getTotal } = useCartStore();
  const navigation = useNavigation<CartScreenNavigationProp>();

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleBrowsePlants = () => {
    // Navigate to Home tab
    navigation.getParent()?.navigate('Home');
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <LinearGradient
            colors={[colors.primary[100], colors.primary[50]]}
            style={styles.emptyIconGradient}
          >
            <MaterialCommunityIcons name="cart-outline" size={56} color={colors.primary[400]} />
          </LinearGradient>
        </View>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Start adding plants to bring life to your space</Text>
        <Button
          title="Browse Plants"
          onPress={handleBrowsePlants}
          icon="leaf"
          size="large"
          style={styles.browseButton}
        />
      </View>
    );
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_HEIGHT + 200 }
        ]}
        showsVerticalScrollIndicator={false}
      >
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

        {getSubtotal() < 50 && (
          <View style={styles.freeShippingBanner}>
            <MaterialCommunityIcons name="truck-fast-outline" size={20} color={colors.primary[600]} />
            <Text style={styles.freeShippingText}>
              Add <Text style={styles.freeShippingAmount}>${(50 - getSubtotal()).toFixed(2)}</Text> more for free delivery
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating checkout footer - positioned above tab bar */}
      <View style={[styles.footerWrapper, { bottom: TAB_BAR_HEIGHT }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 90 : 100}
          tint="light"
          style={styles.footer}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.7)',
              'rgba(255, 255, 255, 0.4)',
            ]}
            style={styles.footerGradient}
          />
          <View style={styles.footerContent}>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${getSubtotal().toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.deliveryLabelContainer}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  {getDeliveryFee() === 0 && (
                    <View style={styles.freeTag}>
                      <Text style={styles.freeTagText}>FREE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.summaryValue, getDeliveryFee() === 0 && styles.freeDelivery]}>
                  {getDeliveryFee() === 0 ? '$0.00' : `$${getDeliveryFee().toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>${getTotal().toFixed(2)}</Text>
              </View>
            </View>

            <Button
              title="Proceed to Checkout"
              onPress={handleCheckout}
              icon="arrow-right"
              iconPosition="right"
              size="large"
              fullWidth
            />
          </View>
        </BlurView>
        <View style={styles.footerBorder} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.neutral[0],
  },
  headerTitle: {
    ...typography.title2,
    color: colors.neutral[900],
  },
  itemCountBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  itemCountText: {
    ...typography.footnote,
    color: colors.primary[700],
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  freeShippingText: {
    ...typography.footnote,
    color: colors.neutral[700],
    flex: 1,
  },
  freeShippingAmount: {
    fontWeight: '700',
    color: colors.primary[600],
  },
  footerWrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  footer: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
  },
  footerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  footerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xxl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    pointerEvents: 'none',
  },
  footerContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  summary: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deliveryLabelContainer: {
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
  freeDelivery: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    ...typography.title3,
    color: colors.neutral[900],
  },
  summaryTotalValue: {
    ...typography.title2,
    color: colors.primary[700],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.neutral[100],
  },
  emptyIconContainer: {
    marginBottom: spacing.xl,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.title2,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  browseButton: {
    minWidth: 200,
  },
});
