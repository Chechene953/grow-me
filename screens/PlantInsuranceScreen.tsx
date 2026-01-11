import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { useAuthStore } from '../stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface InsurancePlan {
  id: string;
  name: string;
  price: number;
  period: string;
  coverage: string;
  features: string[];
  recommended?: boolean;
}

const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'Basic Care',
    price: 4.99,
    period: 'month',
    coverage: 'Up to $50',
    features: [
      'Covers plant death within 30 days',
      'Free replacement for eligible plants',
      'Email support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Care',
    price: 9.99,
    period: 'month',
    coverage: 'Up to $150',
    features: [
      'Covers plant death within 90 days',
      'Free replacement + shipping',
      'Priority support',
      'Plant health consultations',
      'Pest treatment coverage',
    ],
    recommended: true,
  },
  {
    id: 'ultimate',
    name: 'Ultimate Care',
    price: 19.99,
    period: 'month',
    coverage: 'Unlimited',
    features: [
      'Lifetime plant protection',
      'Unlimited replacements',
      '24/7 priority support',
      'Monthly plant health check-ins',
      'Full pest & disease coverage',
      'Accidental damage protection',
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: 'What does plant insurance cover?',
    answer: 'Our plant insurance covers plant death due to natural causes, shipping damage, and depending on your plan, pest infestations and accidental damage.',
  },
  {
    question: 'How do I file a claim?',
    answer: 'Simply take a photo of your affected plant and submit it through the app. Our team will review and process your claim within 24-48 hours.',
  },
  {
    question: 'When does coverage start?',
    answer: 'Coverage begins immediately upon subscription. There\'s no waiting period for new enrollments.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! You can cancel your plant insurance subscription at any time with no cancellation fees.',
  },
];

export const PlantInsuranceScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleSelectPlan = (planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) {
      Alert.alert('Select a Plan', 'Please select an insurance plan to continue.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const plan = INSURANCE_PLANS.find(p => p.id === selectedPlan);
    Alert.alert(
      'Subscription Started!',
      `You've subscribed to ${plan?.name} for $${plan?.price}/${plan?.period}. Your plants are now protected!`
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <ModernHeader title="Plant Insurance" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={[colors.semantic.success, '#2d8a5e']}
          style={styles.heroCard}
        >
          <View style={styles.heroIconContainer}>
            <MaterialCommunityIcons name="shield-check" size={40} color={defaultColors.neutral[0]} />
          </View>
          <Text style={styles.heroTitle}>Protect Your Plants</Text>
          <Text style={styles.heroSubtitle}>
            Get peace of mind with our comprehensive plant protection plans
          </Text>
        </LinearGradient>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.primary[50] }]}>
              <MaterialCommunityIcons name="leaf" size={20} color={colors.primary[600]} />
            </View>
            <Text style={[styles.benefitText, { color: colors.neutral[700] }]}>Free Replacements</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: `${colors.semantic.success}20` }]}>
              <MaterialCommunityIcons name="clock-fast" size={20} color={colors.semantic.success} />
            </View>
            <Text style={[styles.benefitText, { color: colors.neutral[700] }]}>Fast Claims</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: `${colors.accent.gold}20` }]}>
              <MaterialCommunityIcons name="headset" size={20} color={colors.accent.gold} />
            </View>
            <Text style={[styles.benefitText, { color: colors.neutral[700] }]}>Expert Support</Text>
          </View>
        </View>

        {/* Plans */}
        <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Choose Your Plan</Text>
        {INSURANCE_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              { backgroundColor: colors.neutral[0] },
              selectedPlan === plan.id && [styles.planCardSelected, { borderColor: colors.primary[500], backgroundColor: colors.primary[50] }],
              plan.recommended && [styles.planCardRecommended, { borderColor: colors.semantic.success }],
            ]}
            onPress={() => handleSelectPlan(plan.id)}
            activeOpacity={0.8}
          >
            {plan.recommended && (
              <View style={[styles.recommendedBadge, { backgroundColor: colors.semantic.success }]}>
                <MaterialCommunityIcons name="star" size={12} color={defaultColors.neutral[0]} />
                <Text style={styles.recommendedText}>Most Popular</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View>
                <Text style={[styles.planName, { color: colors.neutral[900] }]}>{plan.name}</Text>
                <Text style={[styles.planCoverage, { color: colors.neutral[500] }]}>Coverage: {plan.coverage}</Text>
              </View>
              <View style={styles.planPriceContainer}>
                <Text style={[styles.planPrice, { color: colors.primary[700] }]}>${plan.price}</Text>
                <Text style={[styles.planPeriod, { color: colors.neutral[500] }]}>/{plan.period}</Text>
              </View>
            </View>

            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color={colors.semantic.success}
                  />
                  <Text style={[styles.featureText, { color: colors.neutral[700] }]}>{feature}</Text>
                </View>
              ))}
            </View>

            {selectedPlan === plan.id && (
              <View style={styles.selectedIndicator}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={colors.primary[600]}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, !selectedPlan && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={!selectedPlan}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedPlan
              ? [colors.semantic.success, '#2d8a5e']
              : [colors.neutral[400], colors.neutral[500]]}
            style={styles.subscribeButtonGradient}
          >
            <MaterialCommunityIcons name="shield-check" size={20} color={defaultColors.neutral[0]} />
            <Text style={styles.subscribeButtonText}>Start Protection</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.faqCard, { backgroundColor: colors.neutral[0] }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedFAQ(expandedFAQ === index ? null : index);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: colors.neutral[900] }]}>{faq.question}</Text>
              <MaterialCommunityIcons
                name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.neutral[400]}
              />
            </View>
            {expandedFAQ === index && (
              <Text style={[styles.faqAnswer, { color: colors.neutral[600] }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultColors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },

  // Hero
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.title1,
    color: defaultColors.neutral[0],
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },

  // Benefits
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  benefitItem: {
    alignItems: 'center',
    flex: 1,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.caption,
    fontWeight: '600',
    color: defaultColors.neutral[700],
    textAlign: 'center',
  },

  // Section
  sectionTitle: {
    ...typography.title3,
    color: defaultColors.neutral[900],
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },

  // Plans
  planCard: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  planCardSelected: {
    borderColor: defaultColors.primary[500],
    backgroundColor: defaultColors.primary[50],
  },
  planCardRecommended: {
    borderColor: defaultColors.semantic.success,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: defaultColors.semantic.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  recommendedText: {
    ...typography.caption,
    fontWeight: '700',
    color: defaultColors.neutral[0],
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  planName: {
    ...typography.title3,
    color: defaultColors.neutral[900],
  },
  planCoverage: {
    ...typography.footnote,
    color: defaultColors.neutral[500],
    marginTop: 2,
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    ...typography.title2,
    color: defaultColors.primary[700],
  },
  planPeriod: {
    ...typography.footnote,
    color: defaultColors.neutral[500],
  },
  planFeatures: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.footnote,
    color: defaultColors.neutral[700],
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },

  // Subscribe Button
  subscribeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  subscribeButtonText: {
    ...typography.callout,
    fontWeight: '700',
    color: defaultColors.neutral[0],
  },

  // FAQ
  faqCard: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    ...typography.callout,
    fontWeight: '600',
    color: defaultColors.neutral[900],
    flex: 1,
    marginRight: spacing.sm,
  },
  faqAnswer: {
    ...typography.footnote,
    color: defaultColors.neutral[600],
    marginTop: spacing.md,
    lineHeight: 22,
  },
});
