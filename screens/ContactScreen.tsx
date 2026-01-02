import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface ContactMethod {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  action: () => void;
  color: string;
}

const CONTACT_METHODS: ContactMethod[] = [
  {
    icon: 'email-outline',
    title: 'Email',
    value: 'support@growme.app',
    action: () => Linking.openURL('mailto:support@growme.app'),
    color: colors.primary[600],
  },
  {
    icon: 'phone-outline',
    title: 'Phone',
    value: '+1 (800) 123-4567',
    action: () => Linking.openURL('tel:+18001234567'),
    color: colors.semantic.success,
  },
  {
    icon: 'map-marker-outline',
    title: 'Address',
    value: '123 Plant Street, Garden City, CA 90210',
    action: () => Linking.openURL('https://maps.google.com/?q=Garden+City+CA'),
    color: colors.semantic.warning,
  },
];

const SOCIAL_LINKS = [
  { icon: 'instagram', color: '#E4405F', url: 'https://instagram.com/growme' },
  { icon: 'facebook', color: '#1877F2', url: 'https://facebook.com/growme' },
  { icon: 'twitter', color: '#1DA1F2', url: 'https://twitter.com/growme' },
  { icon: 'pinterest', color: '#BD081C', url: 'https://pinterest.com/growme' },
];

export const ContactScreen = () => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Message Sent!',
        'Thank you for reaching out. We\'ll get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => {
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        }}]
      );
    }, 1500);
  };

  const handleContactMethod = (method: ContactMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    method.action();
  };

  return (
    <View style={styles.container}>
      <ModernHeader title="Contact Us" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            style={styles.heroCard}
          >
            <View style={styles.heroIconContainer}>
              <MaterialCommunityIcons name="message-text" size={32} color={colors.neutral[0]} />
            </View>
            <Text style={styles.heroTitle}>Get in Touch</Text>
            <Text style={styles.heroSubtitle}>
              We'd love to hear from you. Our team typically responds within 24 hours.
            </Text>
          </LinearGradient>

          {/* Contact Methods */}
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          <View style={styles.contactMethods}>
            {CONTACT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.title}
                style={styles.contactMethod}
                onPress={() => handleContactMethod(method)}
                activeOpacity={0.7}
              >
                <View style={[styles.contactMethodIcon, { backgroundColor: `${method.color}20` }]}>
                  <MaterialCommunityIcons name={method.icon} size={24} color={method.color} />
                </View>
                <View style={styles.contactMethodInfo}>
                  <Text style={styles.contactMethodTitle}>{method.title}</Text>
                  <Text style={styles.contactMethodValue}>{method.value}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <Text style={styles.sectionTitle}>Send a Message</Text>
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account-outline" size={20} color={colors.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.neutral[400]}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color={colors.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.neutral[400]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="tag-outline" size={20} color={colors.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="What's this about?"
                  placeholderTextColor={colors.neutral[400]}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="How can we help you?"
                  placeholderTextColor={colors.neutral[400]}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSending && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSending}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isSending ? [colors.neutral[400], colors.neutral[500]] : [colors.primary[500], colors.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {isSending ? (
                  <Text style={styles.submitButtonText}>Sending...</Text>
                ) : (
                  <>
                    <MaterialCommunityIcons name="send" size={18} color={colors.neutral[0]} />
                    <Text style={styles.submitButtonText}>Send Message</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Business Hours */}
          <View style={styles.hoursCard}>
            <View style={styles.hoursHeader}>
              <MaterialCommunityIcons name="clock-outline" size={22} color={colors.primary[600]} />
              <Text style={styles.hoursTitle}>Business Hours</Text>
            </View>
            <View style={styles.hoursList}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Monday - Friday</Text>
                <Text style={styles.hoursTime}>9:00 AM - 6:00 PM EST</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Saturday</Text>
                <Text style={styles.hoursTime}>10:00 AM - 4:00 PM EST</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Sunday</Text>
                <Text style={styles.hoursTime}>Closed</Text>
              </View>
            </View>
          </View>

          {/* Social Links */}
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialContainer}>
            {SOCIAL_LINKS.map((social) => (
              <TouchableOpacity
                key={social.icon}
                style={[styles.socialButton, { backgroundColor: `${social.color}15` }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Linking.openURL(social.url);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={social.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={24}
                  color={social.color}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    color: colors.neutral[0],
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Section
  sectionTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },

  // Contact Methods
  contactMethods: {
    gap: spacing.sm,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  contactMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactMethodInfo: {
    flex: 1,
  },
  contactMethodTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  contactMethodValue: {
    ...typography.footnote,
    color: colors.neutral[500],
    marginTop: 2,
  },

  // Form
  formCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
    paddingVertical: spacing.xs,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  submitButtonText: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[0],
  },

  // Hours
  hoursCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  hoursTitle: {
    ...typography.title3,
    color: colors.neutral[900],
  },
  hoursList: {
    gap: spacing.sm,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursDay: {
    ...typography.callout,
    color: colors.neutral[700],
  },
  hoursTime: {
    ...typography.footnote,
    color: colors.neutral[500],
  },

  // Social
  socialContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
