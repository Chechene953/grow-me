import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';

type TabType = 'terms' | 'privacy';

interface Section {
  title: string;
  content: string;
}

const TERMS_SECTIONS: Section[] = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using the GrowMe application ("App"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the App.',
  },
  {
    title: '2. Use License',
    content: 'Permission is granted to temporarily use the App for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions.',
  },
  {
    title: '3. User Accounts',
    content: 'You are responsible for safeguarding your account password and for any activities or actions under your account. You must notify us immediately upon becoming aware of any breach of security.',
  },
  {
    title: '4. Purchases & Payments',
    content: 'All purchases are processed securely through our payment partners. Prices are subject to change without notice. Subscription fees are billed in advance and are non-refundable.',
  },
  {
    title: '5. Product Information',
    content: 'We strive to display product colors and images as accurately as possible. We cannot guarantee that your device\'s display will accurately reflect the actual product.',
  },
  {
    title: '6. Shipping & Delivery',
    content: 'Shipping times are estimates only and are not guaranteed. We are not liable for delays outside our control. Risk of loss passes to you upon delivery.',
  },
  {
    title: '7. Returns & Refunds',
    content: 'Plants that arrive damaged may be replaced within 48 hours of delivery with photo documentation. Non-plant items may be returned within 14 days in original condition.',
  },
  {
    title: '8. Intellectual Property',
    content: 'All content in the App, including text, graphics, logos, and images, is the property of GrowMe or its licensors and is protected by copyright laws.',
  },
  {
    title: '9. Limitation of Liability',
    content: 'GrowMe shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the App.',
  },
  {
    title: '10. Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. Continued use of the App after changes constitutes acceptance of the modified terms.',
  },
];

const PRIVACY_SECTIONS: Section[] = [
  {
    title: '1. Information We Collect',
    content: 'We collect information you provide directly, such as name, email, shipping address, and payment information. We also collect usage data and device information automatically.',
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use your information to process orders, provide customer support, send promotional communications (with consent), improve our services, and comply with legal obligations.',
  },
  {
    title: '3. Information Sharing',
    content: 'We do not sell your personal information. We may share information with service providers (payment processors, shipping partners), as required by law, or with your consent.',
  },
  {
    title: '4. Data Security',
    content: 'We implement industry-standard security measures including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.',
  },
  {
    title: '5. Cookies & Tracking',
    content: 'We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can manage cookie preferences in your device settings.',
  },
  {
    title: '6. Third-Party Services',
    content: 'Our App may contain links to third-party services. We are not responsible for the privacy practices of these services. Please review their privacy policies.',
  },
  {
    title: '7. Children\'s Privacy',
    content: 'Our App is not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us.',
  },
  {
    title: '8. Your Rights',
    content: 'You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time.',
  },
  {
    title: '9. Data Retention',
    content: 'We retain your information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time.',
  },
  {
    title: '10. Contact Us',
    content: 'For privacy-related questions or concerns, please contact us at privacy@growme.app or through the Contact Us section in the App.',
  },
];

export const TermsPrivacyScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('terms');
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const sections = activeTab === 'terms' ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setExpandedSection(0);
  };

  const toggleSection = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <ModernHeader title="Legal" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.neutral[0] }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
            onPress={() => handleTabChange('terms')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={20}
              color={activeTab === 'terms' ? colors.neutral[0] : colors.neutral[600]}
            />
            <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
              Terms of Service
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
            onPress={() => handleTabChange('privacy')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={20}
              color={activeTab === 'privacy' ? colors.neutral[0] : colors.neutral[600]}
            />
            <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <LinearGradient
          colors={activeTab === 'terms' ? [colors.primary[500], colors.primary[700]] : ['#6B46C1', '#553C9A']}
          style={styles.heroCard}
        >
          <View style={styles.heroIconContainer}>
            <MaterialCommunityIcons
              name={activeTab === 'terms' ? 'file-document' : 'shield-lock'}
              size={32}
              color={colors.neutral[0]}
            />
          </View>
          <Text style={styles.heroTitle}>
            {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </Text>
          <Text style={styles.heroSubtitle}>
            Last updated: January 1, 2026
          </Text>
        </LinearGradient>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primary[50] }]}>
          <MaterialCommunityIcons name="information" size={20} color={colors.primary[600]} />
          <Text style={[styles.infoBannerText, { color: colors.primary[700] }]}>
            {activeTab === 'terms'
              ? 'By using GrowMe, you agree to these terms. Please read them carefully.'
              : 'Your privacy is important to us. This policy explains how we handle your data.'}
          </Text>
        </View>

        {/* Sections */}
        <View style={styles.sectionsContainer}>
          {sections.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.sectionCard, { backgroundColor: colors.neutral[0] }]}
              onPress={() => toggleSection(index)}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionNumber, { backgroundColor: colors.primary[100] }]}>
                  <Text style={[styles.sectionNumberText, { color: colors.primary[600] }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>
                  {section.title.replace(/^\d+\.\s/, '')}
                </Text>
                <MaterialCommunityIcons
                  name={expandedSection === index ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.neutral[400]}
                />
              </View>
              {expandedSection === index && (
                <Text style={[styles.sectionContent, { color: colors.neutral[600], borderTopColor: colors.neutral[100] }]}>{section.content}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.neutral[100] }]}>
          <Text style={[styles.footerText, { color: colors.neutral[600] }]}>
            If you have any questions about these {activeTab === 'terms' ? 'terms' : 'policies'}, please contact us at{' '}
            <Text style={[styles.footerLink, { color: colors.primary[600] }]}>legal@growme.app</Text>
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="download" size={20} color={colors.primary[600]} />
            <Text style={styles.quickLinkText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color={colors.primary[600]} />
            <Text style={styles.quickLinkText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="printer" size={20} color={colors.primary[600]} />
            <Text style={styles.quickLinkText}>Print</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: defaultColors.primary[600],
  },
  tabText: {
    ...typography.footnote,
    fontWeight: '600',
    color: defaultColors.neutral[600],
  },
  tabTextActive: {
    color: defaultColors.neutral[0],
  },

  // Hero
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    ...typography.footnote,
    color: 'rgba(255,255,255,0.8)',
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: defaultColors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoBannerText: {
    ...typography.footnote,
    color: defaultColors.primary[700],
    flex: 1,
    lineHeight: 20,
  },

  // Sections
  sectionsContainer: {
    gap: spacing.sm,
  },
  sectionCard: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: defaultColors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionNumberText: {
    ...typography.footnote,
    fontWeight: '700',
    color: defaultColors.primary[600],
  },
  sectionTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: defaultColors.neutral[900],
    flex: 1,
  },
  sectionContent: {
    ...typography.footnote,
    color: defaultColors.neutral[600],
    lineHeight: 22,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: defaultColors.neutral[100],
  },

  // Footer
  footer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: defaultColors.neutral[100],
    borderRadius: borderRadius.xl,
  },
  footerText: {
    ...typography.footnote,
    color: defaultColors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    color: defaultColors.primary[600],
    fontWeight: '600',
  },

  // Quick Links
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  quickLinkText: {
    ...typography.footnote,
    fontWeight: '600',
    color: defaultColors.primary[600],
  },
});
