import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { ModernHeader } from '../components/ModernHeader';
import { useAuthStore } from '../stores/authStore';
import { stripeService } from '../services/stripeService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface PlanFeature {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  included: boolean;
}

const PLAN_FEATURES: PlanFeature[] = [
  {
    icon: 'headset',
    title: '24/7 Expert Support',
    description: 'Get help from plant experts anytime',
    included: true,
  },
  {
    icon: 'shield-check',
    title: 'Plant Insurance',
    description: 'Coverage for plant damage and death',
    included: true,
  },
  {
    icon: 'bell-ring',
    title: 'Smart Reminders',
    description: 'Personalized watering and care alerts',
    included: true,
  },
  {
    icon: 'chart-timeline-variant',
    title: 'Growth Tracking',
    description: 'Monitor your plant\'s health over time',
    included: true,
  },
  {
    icon: 'percent',
    title: 'Member Discounts',
    description: '15% off all plant purchases',
    included: true,
  },
  {
    icon: 'truck-fast',
    title: 'Priority Shipping',
    description: 'Free expedited delivery on all orders',
    included: true,
  },
];

export const SubscriptionManageScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);

  const hasSubscription = user?.subscription?.active;

  const openBillingPortal = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const customerId = (user as any)?.stripeCustomerId;
      const { url } = await stripeService.getBillingPortalUrl({ customerId });
      await WebBrowser.openBrowserAsync(url);
    } catch (e: any) {
      Alert.alert('Error', 'Unable to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Start Premium',
      'You\'ll be redirected to complete your subscription setup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // In production, this would open Stripe Checkout
            Alert.alert('Coming Soon', 'Subscription checkout will be available soon!');
          },
        },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription? You\'ll lose access to all premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Subscription Cancelled', 'Your subscription will end on the next billing date.');
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ModernHeader title="Subscription" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Card */}
        {hasSubscription ? (
          <LinearGradient
            colors={[colors.accent.gold, '#D4A340']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planCard}
          >
            <View style={styles.planBadge}>
              <MaterialCommunityIcons name="crown" size={16} color={colors.neutral[900]} />
              <Text style={styles.planBadgeText}>PREMIUM</Text>
            </View>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Assisted Monitoring</Text>
                <Text style={styles.planPrice}>
                  ${user?.subscription?.pricePerMonth}
                  <Text style={styles.planPeriod}>/month</Text>
                </Text>
              </View>
              <View style={styles.planStatusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.planStatus}>Active</Text>
              </View>
            </View>
            <View style={styles.planDetails}>
              <View style={styles.planDetailRow}>
                <MaterialCommunityIcons name="calendar" size={16} color="rgba(0,0,0,0.6)" />
                <Text style={styles.planDetailText}>
                  Started {user?.subscription?.startedAt ? formatDate(user.subscription.startedAt) : 'N/A'}
                </Text>
              </View>
              <View style={styles.planDetailRow}>
                <MaterialCommunityIcons name="refresh" size={16} color="rgba(0,0,0,0.6)" />
                <Text style={styles.planDetailText}>
                  Renews {user?.subscription?.renewsAt ? formatDate(user.subscription.renewsAt) : 'automatically'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.noPlanCard}>
            <View style={styles.noPlanIconContainer}>
              <MaterialCommunityIcons name="crown-outline" size={48} color={colors.neutral[300]} />
            </View>
            <Text style={styles.noPlanTitle}>No Active Subscription</Text>
            <Text style={styles.noPlanSubtitle}>
              Upgrade to Premium for exclusive benefits and expert plant care support
            </Text>
          </View>
        )}

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {hasSubscription ? 'Your Premium Benefits' : 'Premium Benefits'}
          </Text>
          <View style={styles.featuresGrid}>
            {PLAN_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIconContainer, hasSubscription && styles.featureIconContainerActive]}>
                  <MaterialCommunityIcons
                    name={feature.icon}
                    size={24}
                    color={hasSubscription ? colors.primary[600] : colors.neutral[400]}
                  />
                </View>
                <Text style={[styles.featureTitle, hasSubscription && styles.featureTitleActive]}>
                  {feature.title}
                </Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                {hasSubscription && (
                  <View style={styles.includedBadge}>
                    <MaterialCommunityIcons name="check-circle" size={14} color={colors.semantic.success} />
                    <Text style={styles.includedText}>Included</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Settings Section (for subscribers) */}
        {hasSubscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons name="autorenew" size={22} color={colors.neutral[600]} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Auto-Renewal</Text>
                    <Text style={styles.settingSubtitle}>Automatically renew subscription</Text>
                  </View>
                </View>
                <Switch
                  value={autoRenew}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAutoRenew(value);
                  }}
                  trackColor={{ false: colors.neutral[200], true: colors.primary[400] }}
                  thumbColor={autoRenew ? colors.primary[600] : colors.neutral[0]}
                />
              </View>
              <View style={styles.settingDivider} />
              <TouchableOpacity
                style={styles.settingRow}
                onPress={openBillingPortal}
                activeOpacity={0.7}
              >
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons name="credit-card-outline" size={22} color={colors.neutral[600]} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Payment Method</Text>
                    <Text style={styles.settingSubtitle}>Update your billing information</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.neutral[300]} />
              </TouchableOpacity>
              <View style={styles.settingDivider} />
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Billing History', 'View your invoices and payment history in the billing portal.');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingInfo}>
                  <MaterialCommunityIcons name="receipt" size={22} color={colors.neutral[600]} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Billing History</Text>
                    <Text style={styles.settingSubtitle}>View invoices and receipts</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.neutral[300]} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {hasSubscription ? (
            <>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={openBillingPortal}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[700]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.manageButtonGradient}
                >
                  <MaterialCommunityIcons name="cog-outline" size={20} color={colors.neutral[0]} />
                  <Text style={styles.manageButtonText}>
                    {loading ? 'Opening...' : 'Manage Subscription'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.accent.gold, '#D4A340']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeButtonGradient}
                >
                  <MaterialCommunityIcons name="crown" size={22} color={colors.neutral[900]} />
                  <View style={styles.subscribeButtonText}>
                    <Text style={styles.subscribeTitle}>Upgrade to Premium</Text>
                    <Text style={styles.subscribePrice}>$9.99/month</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.cancelAnytime}>Cancel anytime. No commitments.</Text>
            </>
          )}
        </View>

        {/* FAQ Link */}
        <TouchableOpacity
          style={styles.faqLink}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Help', 'FAQ section coming soon!');
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="help-circle-outline" size={20} color={colors.primary[600]} />
          <Text style={styles.faqLinkText}>Subscription FAQ</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary[600]} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },

  // Plan Card
  planCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    gap: 4,
    marginBottom: spacing.md,
  },
  planBadgeText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  planName: {
    ...typography.title2,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.6)',
  },
  planStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.success,
  },
  planStatus: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  planDetails: {
    gap: spacing.sm,
  },
  planDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planDetailText: {
    ...typography.footnote,
    color: 'rgba(0,0,0,0.6)',
  },

  // No Plan Card
  noPlanCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  noPlanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noPlanTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  noPlanSubtitle: {
    ...typography.body,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    width: '47%',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIconContainerActive: {
    backgroundColor: colors.primary[50],
  },
  featureTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[400],
    marginBottom: 2,
  },
  featureTitleActive: {
    color: colors.neutral[900],
  },
  featureDescription: {
    ...typography.caption,
    color: colors.neutral[500],
    lineHeight: 16,
  },
  includedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  includedText: {
    ...typography.caption,
    color: colors.semantic.success,
    fontWeight: '600',
  },

  // Settings
  settingsCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginLeft: spacing.lg + 22 + spacing.md,
  },

  // Actions
  actionsSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  manageButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  manageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  manageButtonText: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...typography.callout,
    color: colors.semantic.error,
    fontWeight: '600',
  },
  subscribeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  subscribeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  subscribeButtonText: {
    flex: 1,
  },
  subscribeTitle: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  subscribePrice: {
    ...typography.footnote,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
  },
  cancelAnytime: {
    ...typography.footnote,
    color: colors.neutral[500],
    textAlign: 'center',
  },

  // FAQ Link
  faqLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  faqLinkText: {
    ...typography.callout,
    color: colors.primary[600],
    fontWeight: '600',
  },
});
