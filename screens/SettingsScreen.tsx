import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { useAuthStore } from '../stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface SettingItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  danger,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={() => {
      if (onPress) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }
    }}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress && !rightElement}
  >
    <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={danger ? colors.semantic.error : colors.primary[600]}
      />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (
      onPress && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.neutral[400]}
        />
      )
    )}
  </TouchableOpacity>
);

// Password Change Modal
const PasswordModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={colors.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.neutral[400]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  <MaterialCommunityIcons
                    name={showCurrent ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.neutral[400]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={colors.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.neutral[400]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <MaterialCommunityIcons
                    name={showNew ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.neutral[400]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-check" size={20} color={colors.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.neutral[400]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? [colors.neutral[400], colors.neutral[500]] : [colors.primary[500], colors.primary[700]]}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// 2FA Setup Modal
const TwoFactorModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  enabled: boolean;
  onToggle: (value: boolean) => void;
}> = ({ visible, onClose, enabled, onToggle }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'info' | 'verify'>('info');
  const [loading, setLoading] = useState(false);

  const handleEnable = () => {
    setStep('verify');
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onToggle(!enabled);
      Alert.alert(
        'Success',
        enabled ? '2FA has been disabled' : '2FA has been enabled successfully'
      );
      setStep('info');
      setVerificationCode('');
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {step === 'info' ? (
              <>
                <View style={styles.twoFactorInfo}>
                  <View style={styles.twoFactorIconContainer}>
                    <MaterialCommunityIcons
                      name="shield-lock"
                      size={48}
                      color={colors.primary[600]}
                    />
                  </View>
                  <Text style={styles.twoFactorTitle}>
                    {enabled ? '2FA is Enabled' : 'Enhance Your Security'}
                  </Text>
                  <Text style={styles.twoFactorDescription}>
                    {enabled
                      ? 'Two-factor authentication adds an extra layer of security to your account. You\'ll need to enter a verification code when signing in.'
                      : 'Add an extra layer of protection to your account. When enabled, you\'ll need to enter a verification code in addition to your password.'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, enabled && styles.disableButton]}
                  onPress={handleEnable}
                >
                  <LinearGradient
                    colors={enabled
                      ? [colors.semantic.error, '#c53030']
                      : [colors.primary[500], colors.primary[700]]}
                    style={styles.submitButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name={enabled ? 'shield-off' : 'shield-check'}
                      size={20}
                      color={colors.neutral[0]}
                    />
                    <Text style={styles.submitButtonText}>
                      {enabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.verifyTitle}>Enter Verification Code</Text>
                <Text style={styles.verifyDescription}>
                  We've sent a 6-digit code to your email address. Enter it below to verify.
                </Text>

                <View style={styles.codeInputContainer}>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="000000"
                    placeholderTextColor={colors.neutral[300]}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleVerify}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? [colors.neutral[400], colors.neutral[500]] : [colors.primary[500], colors.primary[700]]}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? 'Verifying...' : 'Verify & Continue'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep('info')}
                >
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);

  const handleSignOut = () => {
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, including orders, favorites, and subscription will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'I Understand',
                  style: 'destructive',
                  onPress: async () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    // Simulate account deletion
                    Alert.alert('Account Deleted', 'Your account has been deleted.');
                    await signOut();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ModernHeader title="Settings" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <SettingItem
            icon="account-edit"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => router.push('/edit-profile')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="lock-reset"
            title="Change Password"
            subtitle="Update your password regularly"
            onPress={() => setPasswordModalVisible(true)}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="shield-lock"
            title="Two-Factor Authentication"
            subtitle={twoFactorEnabled ? 'Enabled' : 'Add extra security'}
            onPress={() => setTwoFactorModalVisible(true)}
            rightElement={
              <View style={[styles.statusBadge, twoFactorEnabled && styles.statusBadgeActive]}>
                <Text style={[styles.statusBadgeText, twoFactorEnabled && styles.statusBadgeTextActive]}>
                  {twoFactorEnabled ? 'On' : 'Off'}
                </Text>
              </View>
            }
          />
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.section}>
          <SettingItem
            icon="bell-outline"
            title="Push Notifications"
            subtitle="Receive order and care reminders"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setNotificationsEnabled(value);
                }}
                trackColor={{ false: colors.neutral[200], true: colors.primary[400] }}
                thumbColor={notificationsEnabled ? colors.primary[600] : colors.neutral[0]}
              />
            }
          />
          <View style={styles.divider} />
          <SettingItem
            icon="email-outline"
            title="Email Updates"
            subtitle="Promotions and newsletters"
            rightElement={
              <Switch
                value={emailUpdates}
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEmailUpdates(value);
                }}
                trackColor={{ false: colors.neutral[200], true: colors.primary[400] }}
                thumbColor={emailUpdates ? colors.primary[600] : colors.neutral[0]}
              />
            }
          />
        </View>

        {/* App Section */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.section}>
          <SettingItem
            icon="palette-outline"
            title="Appearance"
            subtitle="Dark mode, themes"
            onPress={() => Alert.alert('Coming Soon', 'Theme settings will be available soon!')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="translate"
            title="Language"
            subtitle="English (US)"
            onPress={() => Alert.alert('Coming Soon', 'Language settings will be available soon!')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="cellphone"
            title="App Version"
            subtitle="1.0.0 (Build 1)"
          />
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.section}>
          <SettingItem
            icon="logout"
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleSignOut}
            danger
          />
          <View style={styles.divider} />
          <SettingItem
            icon="delete-forever"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            danger
          />
        </View>
      </ScrollView>

      <PasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />

      <TwoFactorModal
        visible={twoFactorModalVisible}
        onClose={() => setTwoFactorModalVisible(false)}
        enabled={twoFactorEnabled}
        onToggle={setTwoFactorEnabled}
      />
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

  // Sections
  sectionTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    marginTop: spacing.md,
  },
  section: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginLeft: spacing.lg + 44 + spacing.md,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconDanger: {
    backgroundColor: `${colors.semantic.error}15`,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  settingTitleDanger: {
    color: colors.semantic.error,
  },
  settingSubtitle: {
    ...typography.footnote,
    color: colors.neutral[500],
    marginTop: 2,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.neutral[100],
  },
  statusBadgeActive: {
    backgroundColor: colors.semantic.success,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  statusBadgeTextActive: {
    color: colors.neutral[0],
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.neutral[900],
  },
  modalClose: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.lg,
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.lg,
  },

  // Input
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
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral[900],
    paddingVertical: spacing.md,
  },

  // Buttons
  submitButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  disableButton: {},
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
  backButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  backButtonText: {
    ...typography.callout,
    color: colors.primary[600],
    fontWeight: '600',
  },

  // 2FA
  twoFactorInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  twoFactorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  twoFactorTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  twoFactorDescription: {
    ...typography.footnote,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },

  // Verification
  verifyTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  verifyDescription: {
    ...typography.footnote,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  codeInputContainer: {
    marginBottom: spacing.xl,
  },
  codeInput: {
    ...typography.title1,
    textAlign: 'center',
    letterSpacing: 8,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
});
