import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/orderService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';
import { SkeletonLoader, ProfileMenuSkeleton } from '../components/SkeletonLoader';

const TAB_BAR_HEIGHT = 100;

interface MenuItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  badge?: number;
  danger?: boolean;
  premium?: boolean;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  subtitle,
  onPress,
  badge,
  danger,
  premium,
  showArrow = true,
  rightElement,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          style={[
            styles.menuIconContainer,
            { backgroundColor: colors.primary[50] },
            danger && { backgroundColor: `${colors.semantic.error}15` },
            premium && { backgroundColor: `${colors.accent.gold}20` },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={
              danger
                ? colors.semantic.error
                : premium
                ? colors.accent.gold
                : colors.primary[600]
            }
          />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuItemText, { color: colors.neutral[800] }, danger && { color: colors.semantic.error }]}>
            {label}
          </Text>
          {subtitle && <Text style={[styles.menuSubtext, { color: colors.neutral[500] }]}>{subtitle}</Text>}
        </View>
        {badge !== undefined && badge > 0 && (
          <View style={[styles.menuBadge, { backgroundColor: colors.primary[600] }]}>
            <Text style={[styles.menuBadgeText, { color: colors.neutral[0] }]}>{badge}</Text>
          </View>
        )}
        {premium && (
          <View style={[styles.proBadge, { backgroundColor: colors.accent.gold }]}>
            <Text style={[styles.proBadgeText, { color: colors.neutral[900] }]}>PRO</Text>
          </View>
        )}
        {rightElement}
        {showArrow && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.neutral[300]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Quick Stats Card
const QuickStats: React.FC<{
  orders: number;
  favorites: number;
  plants: number;
}> = ({ orders, favorites, plants }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.statsContainer, { backgroundColor: colors.neutral[0] }]}>
      <View style={styles.statCard}>
        <View style={[styles.statIconBg, { backgroundColor: colors.primary[50] }]}>
          <MaterialCommunityIcons name="package-variant" size={20} color={colors.primary[600]} />
        </View>
        <Text style={[styles.statNumber, { color: colors.neutral[900] }]}>{orders}</Text>
        <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>Orders</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.neutral[100] }]} />
      <View style={styles.statCard}>
        <View style={[styles.statIconBg, { backgroundColor: `${colors.semantic.error}15` }]}>
          <MaterialCommunityIcons name="heart" size={20} color={colors.semantic.error} />
        </View>
        <Text style={[styles.statNumber, { color: colors.neutral[900] }]}>{favorites}</Text>
        <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>Favorites</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.neutral[100] }]} />
      <View style={styles.statCard}>
        <View style={[styles.statIconBg, { backgroundColor: colors.semantic.success + '20' }]}>
          <MaterialCommunityIcons name="flower-tulip" size={20} color={colors.semantic.success} />
        </View>
        <Text style={[styles.statNumber, { color: colors.neutral[900] }]}>{plants}</Text>
        <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>Plants</Text>
      </View>
    </View>
  );
};

// Loading State
const ProfileSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonHeader}>
      <SkeletonLoader width={100} height={100} borderRadius={50} />
      <SkeletonLoader width={150} height={24} style={{ marginTop: 16 }} />
      <SkeletonLoader width={200} height={18} style={{ marginTop: 8 }} />
    </View>
    <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
      <ProfileMenuSkeleton />
    </View>
    <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
      <ProfileMenuSkeleton />
    </View>
  </View>
);

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, signOut, loadUser } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await loadUser();
    await loadOrderCount();
    setLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const loadOrderCount = async () => {
    if (!user?.id) return;
    try {
      const orders = await orderService.getUserOrders(user.id);
      setOrderCount(orders.length);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    await loadOrderCount();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await signOut();
        },
      },
    ]);
  };

  const handleNotificationToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(value);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colors.neutral[100] }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.neutral[0]}
            colors={[colors.primary[600]]}
          />
        }
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={[colors.primary[600], colors.primary[500]]}
          style={[styles.header, { paddingTop: insets.top + spacing.xl }]}
        >
          {/* Settings Button */}
          <TouchableOpacity
            style={[styles.settingsButton, { top: insets.top + spacing.md }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/settings');
            }}
          >
            <View style={[styles.settingsBlur, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
              <MaterialCommunityIcons name="cog-outline" size={22} color={colors.primary[700]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.9}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={[colors.primary[300], colors.primary[400]]}
                style={styles.avatarPlaceholder}
              >
                <MaterialCommunityIcons name="account" size={48} color={colors.neutral[0]} />
              </LinearGradient>
            )}
            <View style={styles.avatarBadge}>
              <MaterialCommunityIcons name="pencil" size={12} color={colors.neutral[0]} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>

          {/* Member Badge */}
          {user?.subscription?.active && (
            <View style={styles.memberBadge}>
              <MaterialCommunityIcons name="crown" size={14} color={colors.accent.gold} />
              <Text style={styles.memberBadgeText}>Premium Member</Text>
            </View>
          )}
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsWrapper}>
          <QuickStats
            orders={orderCount}
            favorites={user?.favorites?.length || 0}
            plants={user?.favorites?.length || 0}
          />
        </View>

        {/* Menu sections */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>My Account</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.neutral[0] }]}>
            <MenuItem
              icon="package-variant"
              label="My Orders"
              subtitle="Track and manage your orders"
              onPress={() => router.push('/orders')}
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.neutral[100] }]} />
            <MenuItem
              icon="heart"
              label="Favorites"
              subtitle="Your saved plants"
              onPress={() => router.push('/favorites')}
              badge={user?.favorites?.length || 0}
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.neutral[100] }]} />
            <MenuItem
              icon="account-edit"
              label="Edit Profile"
              subtitle="Update your information"
              onPress={() => router.push('/edit-profile')}
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.neutral[100] }]} />
            <MenuItem
              icon="map-marker-outline"
              label="Addresses"
              subtitle="Manage delivery addresses"
              onPress={() => router.push('/edit-profile')}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>Plant Care</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.neutral[0] }]}>
            <MenuItem
              icon="book-open-page-variant"
              label="Care Tips"
              subtitle="Learn how to care for your plants"
              onPress={() => router.push('/care-tips')}
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.neutral[100] }]} />
            <MenuItem
              icon="bell-outline"
              label="Watering Reminders"
              subtitle="Get notified when to water"
              onPress={() => {}}
              showArrow={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: colors.neutral[200], true: colors.primary[400] }}
                  thumbColor={notificationsEnabled ? colors.primary[600] : colors.neutral[0]}
                />
              }
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>Subscription</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.neutral[0] }]}>
            <MenuItem
              icon="crown"
              label="Premium Membership"
              subtitle={user?.subscription?.active ? 'Active' : 'Upgrade for exclusive benefits'}
              onPress={() => router.push('/subscription-manage')}
              premium
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.neutral[100] }]} />
            <MenuItem
              icon="shield-check"
              label="Plant Insurance"
              subtitle="Protect your plants"
              onPress={() => router.push('/plant-insurance')}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>Support</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.neutral[0] }]}>
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              subtitle="FAQs and support"
              onPress={() => router.push('/help-center')}
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.neutral[100] }]} />
            <MenuItem
              icon="chat"
              label="Live Chat"
              subtitle="Chat with our support team"
              onPress={() => router.push('/live-chat')}
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.neutral[100] }]} />
            <MenuItem
              icon="message-text-outline"
              label="Contact Us"
              subtitle="Get in touch with our team"
              onPress={() => router.push('/contact')}
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.neutral[100] }]} />
            <MenuItem
              icon="file-document-outline"
              label="Terms & Privacy"
              subtitle="Legal information"
              onPress={() => router.push('/terms-privacy')}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={[styles.menuCard, { backgroundColor: colors.neutral[0] }]}>
            <MenuItem
              icon="logout"
              label="Sign Out"
              onPress={handleSignOut}
              danger
              showArrow={false}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={[styles.appLogoContainer, { backgroundColor: colors.primary[50] }]}>
            <MaterialCommunityIcons name="leaf" size={24} color={colors.primary[600]} />
          </View>
          <Text style={[styles.appName, { color: colors.neutral[800] }]}>GrowMe</Text>
          <Text style={[styles.version, { color: colors.neutral[400] }]}>Version 1.0.0</Text>
          <Text style={[styles.copyright, { color: colors.neutral[400] }]}>Made with love for plant lovers</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  skeletonHeader: {
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 40,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xxl + 20,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
  },
  settingsBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.neutral[0],
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.neutral[0],
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.neutral[0],
  },
  name: {
    ...typography.title2,
    color: colors.neutral[0],
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  memberBadgeText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[0],
  },

  // Stats
  statsWrapper: {
    marginTop: -30,
    paddingHorizontal: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.sm,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    ...typography.title2,
    color: colors.neutral[900],
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
  },

  // Menu sections
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.footnote,
    color: colors.neutral[500],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  menuCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuIconContainerDanger: {
    backgroundColor: `${colors.semantic.error}15`,
  },
  menuIconContainerPremium: {
    backgroundColor: `${colors.accent.gold}20`,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  menuItemTextDanger: {
    color: colors.semantic.error,
  },
  menuSubtext: {
    ...typography.footnote,
    color: colors.neutral[500],
    marginTop: 2,
  },
  menuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  proBadge: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  proBadgeText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginLeft: spacing.md + 44 + spacing.md,
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  appLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.title3,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  version: {
    ...typography.footnote,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },
  copyright: {
    ...typography.caption,
    color: colors.neutral[400],
  },
});
