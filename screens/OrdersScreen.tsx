import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Platform,
  RefreshControl,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/orderService';
import { Order, OrderStatus } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ModernHeader } from '../components/ModernHeader';
import { OrderCardSkeleton } from '../components/SkeletonLoader';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

const STATUS_CONFIG: Record<OrderStatus, {
  color: string;
  bgColor: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}> = {
  'Processing': {
    color: colors.accent.gold,
    bgColor: `${colors.accent.gold}15`,
    icon: 'clock-outline',
    label: 'Processing'
  },
  'Shipped': {
    color: '#1976D2',
    bgColor: '#1976D215',
    icon: 'truck-delivery-outline',
    label: 'Shipped'
  },
  'Out for Delivery': {
    color: '#7B1FA2',
    bgColor: '#7B1FA215',
    icon: 'map-marker-radius-outline',
    label: 'Out for Delivery'
  },
  'Delivered': {
    color: colors.semantic.success,
    bgColor: `${colors.semantic.success}15`,
    icon: 'check-circle-outline',
    label: 'Delivered'
  },
  'Cancelled': {
    color: colors.semantic.error,
    bgColor: `${colors.semantic.error}15`,
    icon: 'close-circle-outline',
    label: 'Cancelled'
  },
};

const TRACKING_STEPS: OrderStatus[] = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

interface OrderCardProps {
  order: Order;
  onTrack: () => void;
  onCancel: () => void;
  onReorder: () => void;
  expanded: boolean;
  onToggle: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onTrack,
  onCancel,
  onReorder,
  expanded,
  onToggle,
}) => {
  const expandAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const statusConfig = STATUS_CONFIG[order.status];

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCurrentStepIndex = () => {
    if (order.status === 'Cancelled') return -1;
    return TRACKING_STEPS.indexOf(order.status);
  };

  const expandedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, order.status !== 'Delivered' && order.status !== 'Cancelled' ? 280 : 180],
  });

  const rotateArrow = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View style={[styles.orderCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <MaterialCommunityIcons
                name={statusConfig.icon}
                size={14}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
                color={colors.neutral[400]}
              />
            </Animated.View>
          </View>
        </View>

        {/* Items Preview */}
        <View style={styles.itemsPreview}>
          <View style={styles.itemImages}>
            {order.items.slice(0, 3).map((item, index) => (
              <View
                key={index}
                style={[
                  styles.itemImageContainer,
                  { marginLeft: index > 0 ? -12 : 0, zIndex: 3 - index }
                ]}
              >
                <Image
                  source={{ uri: item.plant.images[0] }}
                  style={styles.itemImage}
                />
              </View>
            ))}
            {order.items.length > 3 && (
              <View style={[styles.itemImageContainer, styles.moreItems, { marginLeft: -12 }]}>
                <Text style={styles.moreItemsText}>+{order.items.length - 3}</Text>
              </View>
            )}
          </View>
          <View style={styles.itemsInfo}>
            <Text style={styles.itemsCount}>
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
            </Text>
            <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Estimated Delivery */}
        {order.estimatedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
          <View style={styles.estimatedDelivery}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.primary[600]} />
            <Text style={styles.estimatedText}>
              Estimated delivery: {formatDate(order.estimatedDelivery)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Expanded Content */}
      <Animated.View style={[styles.expandedContent, { height: expandedHeight }]}>
        <View style={styles.expandedInner}>
          {/* Tracking Timeline - only show for active orders */}
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <View style={styles.trackingSection}>
              <Text style={styles.sectionTitle}>Order Progress</Text>
              <View style={styles.timeline}>
                {TRACKING_STEPS.map((step, index) => {
                  const currentIndex = getCurrentStepIndex();
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const stepConfig = STATUS_CONFIG[step];

                  return (
                    <View key={step} style={styles.timelineStep}>
                      <View style={styles.timelineIconContainer}>
                        <View style={[
                          styles.timelineDot,
                          isCompleted && { backgroundColor: colors.primary[600] },
                          isCurrent && styles.timelineDotCurrent,
                        ]}>
                          {isCompleted && (
                            <MaterialCommunityIcons
                              name="check"
                              size={12}
                              color={colors.neutral[0]}
                            />
                          )}
                        </View>
                        {index < TRACKING_STEPS.length - 1 && (
                          <View style={[
                            styles.timelineLine,
                            isCompleted && { backgroundColor: colors.primary[600] },
                          ]} />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={[
                          styles.timelineLabel,
                          isCompleted && styles.timelineLabelActive,
                          isCurrent && styles.timelineLabelCurrent,
                        ]}>
                          {stepConfig.label}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Tracking Number */}
          {order.trackingNumber && (
            <TouchableOpacity
              style={styles.trackingInfo}
              onPress={() => {
                if (order.carrier) {
                  // Open carrier tracking page
                  const trackingUrls: Record<string, string> = {
                    'UPS': `https://www.ups.com/track?tracknum=${order.trackingNumber}`,
                    'FedEx': `https://www.fedex.com/apps/fedextrack/?tracknumbers=${order.trackingNumber}`,
                    'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`,
                  };
                  const url = trackingUrls[order.carrier];
                  if (url) Linking.openURL(url);
                }
              }}
            >
              <View style={styles.trackingLeft}>
                <MaterialCommunityIcons name="barcode" size={20} color={colors.primary[600]} />
                <View>
                  <Text style={styles.trackingLabel}>{order.carrier || 'Carrier'}</Text>
                  <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="open-in-new" size={18} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && order.canCancel !== false && (
              <TouchableOpacity style={styles.actionButton} onPress={onCancel}>
                <MaterialCommunityIcons name="close-circle-outline" size={18} color={colors.semantic.error} />
                <Text style={[styles.actionButtonText, { color: colors.semantic.error }]}>
                  Cancel Order
                </Text>
              </TouchableOpacity>
            )}
            {order.status === 'Delivered' && (
              <TouchableOpacity style={styles.actionButton} onPress={onReorder}>
                <MaterialCommunityIcons name="refresh" size={18} color={colors.primary[600]} />
                <Text style={[styles.actionButtonText, { color: colors.primary[600] }]}>
                  Reorder
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]} onPress={onTrack}>
              <MaterialCommunityIcons name="eye-outline" size={18} color={colors.neutral[0]} />
              <Text style={[styles.actionButtonText, { color: colors.neutral[0] }]}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export const OrdersScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const userOrders = await orderService.getUserOrders(user.id);
      // Add mock tracking data for demo
      const ordersWithTracking = userOrders.map((order: Order) => ({
        ...order,
        trackingNumber: order.status === 'Shipped' || order.status === 'Delivered'
          ? `1Z${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          : undefined,
        carrier: order.status === 'Shipped' || order.status === 'Delivered' ? 'UPS' : undefined,
        estimatedDelivery: order.status !== 'Delivered' && order.status !== 'Cancelled'
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          : undefined,
        canCancel: order.status === 'Processing',
      }));
      setOrders(ordersWithTracking);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              // In real app, call orderService.cancelOrder(orderId)
              setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'Cancelled' as OrderStatus } : o
              ));
              Alert.alert('Order Cancelled', 'Your order has been cancelled. A refund will be processed within 5-7 business days.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleReorder = (order: Order) => {
    Alert.alert(
      'Reorder',
      'Add all items from this order to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: () => {
            // In real app, add items to cart
            router.push('/(tabs)/cart');
          }
        },
      ]
    );
  };

  const handleViewDetails = (orderId: string) => {
    // Navigate to order details screen
    router.push(`/order-confirmation/${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return !['Delivered', 'Cancelled'].includes(order.status);
    if (filter === 'completed') return ['Delivered', 'Cancelled'].includes(order.status);
    return true;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ModernHeader title="My Orders" />
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <ModernHeader title="My Orders" />
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[colors.primary[100], colors.primary[50]]}
            style={styles.emptyIconGradient}
          >
            <MaterialCommunityIcons name="package-variant-closed" size={64} color={colors.primary[400]} />
          </LinearGradient>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>
            When you place an order, it will appear here so you can track its status.
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => router.replace('/(tabs)')}
            icon="leaf"
            size="large"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ModernHeader title="My Orders" />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
            {f === 'active' && orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            expanded={expandedOrderId === item.id}
            onToggle={() => setExpandedOrderId(expandedOrderId === item.id ? null : item.id)}
            onTrack={() => handleViewDetails(item.id)}
            onCancel={() => handleCancelOrder(item.id)}
            onReorder={() => handleReorder(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[600]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyFilter}>
            <MaterialCommunityIcons name="filter-off-outline" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyFilterText}>No {filter} orders</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[0],
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.neutral[100],
    gap: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: colors.primary[600],
  },
  filterTabText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  filterTabTextActive: {
    color: colors.neutral[0],
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  orderCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  orderId: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  orderDate: {
    ...typography.footnote,
    color: colors.neutral[500],
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  itemImages: {
    flexDirection: 'row',
  },
  itemImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.neutral[0],
    backgroundColor: colors.neutral[100],
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  moreItems: {
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary[700],
  },
  itemsInfo: {
    alignItems: 'flex-end',
  },
  itemsCount: {
    ...typography.footnote,
    color: colors.neutral[500],
  },
  orderTotal: {
    ...typography.title3,
    fontWeight: '700',
    color: colors.primary[700],
  },
  estimatedDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  estimatedText: {
    ...typography.footnote,
    color: colors.primary[700],
    fontWeight: '500',
  },
  expandedContent: {
    overflow: 'hidden',
  },
  expandedInner: {
    padding: spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  trackingSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 32,
  },
  timelineIconContainer: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[0],
  },
  timelineDotCurrent: {
    borderWidth: 3,
    borderColor: colors.primary[200],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingBottom: spacing.sm,
  },
  timelineLabel: {
    ...typography.footnote,
    color: colors.neutral[400],
  },
  timelineLabelActive: {
    color: colors.neutral[700],
    fontWeight: '500',
  },
  timelineLabelCurrent: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  trackingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trackingLabel: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  trackingNumber: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[900],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    gap: spacing.xs,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary[600],
  },
  actionButtonText: {
    ...typography.footnote,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
    maxWidth: 280,
  },
  emptyFilter: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyFilterText: {
    ...typography.body,
    color: colors.neutral[400],
    marginTop: spacing.md,
  },
});
