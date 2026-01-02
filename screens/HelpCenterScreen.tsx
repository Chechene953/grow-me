import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  faqs: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'Orders & Shipping',
    icon: 'truck-delivery',
    faqs: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery. Plants are carefully packaged to ensure they arrive healthy.',
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes! Once your order ships, you\'ll receive an email with tracking information. You can also view order status in the "My Orders" section of your profile.',
      },
      {
        question: 'What if my plant arrives damaged?',
        answer: 'We guarantee plant health on arrival. If your plant arrives damaged, contact us within 48 hours with photos and we\'ll send a replacement or refund.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within the United States and Canada. We\'re working on expanding to more countries soon.',
      },
    ],
  },
  {
    title: 'Plant Care',
    icon: 'flower-tulip',
    faqs: [
      {
        question: 'How do I know when to water my plant?',
        answer: 'Check the soil moisture - if the top 1-2 inches are dry, it\'s time to water. Each plant in our app has specific watering guidelines in the Care Tips section.',
      },
      {
        question: 'My plant\'s leaves are turning yellow. What should I do?',
        answer: 'Yellow leaves can indicate overwatering, underwatering, or too much direct sunlight. Check your watering schedule and move the plant to indirect light.',
      },
      {
        question: 'Can I put my plant outside?',
        answer: 'It depends on the plant and your climate. Check the plant\'s light requirements in the app. Most houseplants prefer indirect light and stable temperatures.',
      },
    ],
  },
  {
    title: 'Account & Payments',
    icon: 'account-circle',
    faqs: [
      {
        question: 'How do I update my payment method?',
        answer: 'Go to Profile > Subscription > Payment Method to update your card details. You can also add multiple payment methods.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use Stripe for payment processing, which is PCI-DSS compliant. We never store your full card details on our servers.',
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'Go to Profile > Subscription > Cancel Subscription. You\'ll retain access until the end of your billing period.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    icon: 'cash-refund',
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 14 days of delivery for non-perishable items. Plants cannot be returned, but we offer replacements for plants that arrive in poor condition.',
      },
      {
        question: 'How long do refunds take?',
        answer: 'Refunds are processed within 5-7 business days after we receive the returned item. It may take an additional 3-5 days to appear on your statement.',
      },
    ],
  },
];

const FAQAccordion: React.FC<{
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ item, isExpanded, onToggle }) => (
  <TouchableOpacity
    style={styles.faqItem}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle();
    }}
    activeOpacity={0.7}
  >
    <View style={styles.faqHeader}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <MaterialCommunityIcons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={22}
        color={colors.neutral[400]}
      />
    </View>
    {isExpanded && (
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    )}
  </TouchableOpacity>
);

export const HelpCenterScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const handleContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('mailto:support@growme.app');
  };

  const filteredData = searchQuery
    ? FAQ_DATA.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(
          faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.faqs.length > 0)
    : FAQ_DATA;

  return (
    <View style={styles.container}>
      <ModernHeader title="Help Center" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleContact}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[50] }]}>
              <MaterialCommunityIcons name="email-outline" size={24} color={colors.primary[600]} />
            </View>
            <Text style={styles.quickActionText}>Email Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL('tel:+18001234567');
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.semantic.success + '20' }]}>
              <MaterialCommunityIcons name="phone-outline" size={24} color={colors.semantic.success} />
            </View>
            <Text style={styles.quickActionText}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.accent.gold + '20' }]}>
              <MaterialCommunityIcons name="chat-outline" size={24} color={colors.accent.gold} />
            </View>
            <Text style={styles.quickActionText}>Live Chat</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Categories */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {filteredData.length === 0 ? (
          <View style={styles.noResults}>
            <MaterialCommunityIcons name="magnify-close" size={48} color={colors.neutral[300]} />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>Try a different search term</Text>
          </View>
        ) : (
          filteredData.map((category, catIndex) => (
            <View key={category.title} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedCategory(expandedCategory === catIndex ? null : catIndex);
                }}
              >
                <View style={styles.categoryIconContainer}>
                  <MaterialCommunityIcons name={category.icon} size={22} color={colors.primary[600]} />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{category.faqs.length}</Text>
                </View>
                <MaterialCommunityIcons
                  name={expandedCategory === catIndex ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>

              {expandedCategory === catIndex && (
                <View style={styles.faqList}>
                  {category.faqs.map((faq, faqIndex) => (
                    <FAQAccordion
                      key={faqIndex}
                      item={faq}
                      isExpanded={expandedFAQ === `${catIndex}-${faqIndex}`}
                      onToggle={() =>
                        setExpandedFAQ(
                          expandedFAQ === `${catIndex}-${faqIndex}` ? null : `${catIndex}-${faqIndex}`
                        )
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          ))
        )}

        {/* Contact Banner */}
        <View style={styles.contactBanner}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            style={styles.contactBannerGradient}
          >
            <View style={styles.contactBannerIcon}>
              <MaterialCommunityIcons name="headset" size={32} color={colors.neutral[0]} />
            </View>
            <View style={styles.contactBannerContent}>
              <Text style={styles.contactBannerTitle}>Still need help?</Text>
              <Text style={styles.contactBannerSubtitle}>
                Our support team is available 24/7
              </Text>
            </View>
            <TouchableOpacity
              style={styles.contactBannerButton}
              onPress={handleContact}
              activeOpacity={0.8}
            >
              <Text style={styles.contactBannerButtonText}>Contact</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
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

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[800],
  },

  // Section
  sectionTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },

  // No Results
  noResults: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  noResultsText: {
    ...typography.title3,
    color: colors.neutral[600],
    marginTop: spacing.md,
  },
  noResultsSubtext: {
    ...typography.footnote,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },

  // Category
  categoryCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[900],
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[600],
  },

  // FAQ
  faqList: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  faqItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  faqQuestion: {
    ...typography.callout,
    fontWeight: '500',
    color: colors.neutral[800],
    flex: 1,
  },
  faqAnswer: {
    ...typography.footnote,
    color: colors.neutral[600],
    marginTop: spacing.md,
    lineHeight: 22,
  },

  // Contact Banner
  contactBanner: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  contactBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  contactBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactBannerContent: {
    flex: 1,
  },
  contactBannerTitle: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  contactBannerSubtitle: {
    ...typography.footnote,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  contactBannerButton: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  contactBannerButtonText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.primary[600],
  },
});
