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
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
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

// 2FA Setup Modal with TOTP (Google Authenticator)
const TwoFactorModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  userId: string;
  userEmail: string;
}> = ({ visible, onClose, enabled, onToggle, userId, userEmail }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'info' | 'setup' | 'verify' | 'recovery'>('info');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<{ secret: string; qrCodeUrl: string; manualEntryKey: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showManualKey, setShowManualKey] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      // Import totpService dynamically to avoid circular dependencies
      const { totpService } = await import('../services/totpService');
      const totpSecret = await totpService.generateSecret(userId, userEmail);
      setSecret(totpSecret);
      setStep('setup');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = () => {
    setStep('verify');
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { totpService } = await import('../services/totpService');

      if (enabled) {
        // Disabling 2FA
        const result = await totpService.verifyCode(userId, verificationCode);
        if (result.valid) {
          await totpService.disable2FA(userId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onToggle(false);
          Alert.alert('Success', '2FA has been disabled');
          resetAndClose();
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', result.error || 'Invalid verification code');
        }
      } else {
        // Enabling 2FA
        const result = await totpService.enable2FA(userId, verificationCode);
        if (result.success) {
          // Generate recovery codes
          const codes = totpService.generateRecoveryCodes();
          setRecoveryCodes(codes);
          setStep('recovery');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', result.error || 'Invalid verification code');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onToggle(true);
    Alert.alert('Success', '2FA has been enabled successfully');
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('info');
    setVerificationCode('');
    setSecret(null);
    setRecoveryCodes([]);
    setShowManualKey(false);
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    // In production, use @react-native-clipboard/clipboard
    Alert.alert('Copied', 'Key copied to clipboard');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ScrollView style={styles.modalOverlay} contentContainerStyle={styles.modalScrollContent}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={resetAndClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
            <TouchableOpacity style={styles.modalClose} onPress={resetAndClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {step === 'info' && (
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
                      ? 'Your account is protected with two-factor authentication using an authenticator app like Google Authenticator.'
                      : 'Add an extra layer of protection using Google Authenticator, Authy, or any TOTP-compatible app.'}
                  </Text>
                </View>

                {/* Supported Apps */}
                <View style={styles.supportedApps}>
                  <Text style={styles.supportedAppsLabel}>Compatible with:</Text>
                  <View style={styles.supportedAppsIcons}>
                    <View style={styles.appBadge}>
                      <MaterialCommunityIcons name="google" size={16} color={colors.neutral[600]} />
                      <Text style={styles.appBadgeText}>Google</Text>
                    </View>
                    <View style={styles.appBadge}>
                      <MaterialCommunityIcons name="key" size={16} color={colors.neutral[600]} />
                      <Text style={styles.appBadgeText}>Authy</Text>
                    </View>
                    <View style={styles.appBadge}>
                      <MaterialCommunityIcons name="microsoft" size={16} color={colors.neutral[600]} />
                      <Text style={styles.appBadgeText}>Microsoft</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={enabled ? handleDisable : handleSetup}
                  disabled={loading}
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
                      {loading ? 'Loading...' : enabled ? 'Disable 2FA' : 'Set Up 2FA'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {step === 'setup' && secret && (
              <>
                <Text style={styles.setupTitle}>Scan QR Code</Text>
                <Text style={styles.setupDescription}>
                  Open your authenticator app and scan this QR code to add your account.
                </Text>

                {/* QR Code */}
                <View style={styles.qrCodeContainer}>
                  {/* Using an Image component to display QR code from URL */}
                  <View style={styles.qrCodePlaceholder}>
                    <MaterialCommunityIcons name="qrcode" size={120} color={colors.neutral[300]} />
                    <Text style={styles.qrCodeHint}>
                      QR Code would be displayed here
                    </Text>
                  </View>
                </View>

                {/* Manual Entry Option */}
                <TouchableOpacity
                  style={styles.manualEntryToggle}
                  onPress={() => setShowManualKey(!showManualKey)}
                >
                  <Text style={styles.manualEntryToggleText}>
                    {showManualKey ? 'Hide manual entry key' : "Can't scan? Enter key manually"}
                  </Text>
                  <MaterialCommunityIcons
                    name={showManualKey ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.primary[600]}
                  />
                </TouchableOpacity>

                {showManualKey && (
                  <View style={styles.manualKeyContainer}>
                    <Text style={styles.manualKeyLabel}>Secret Key:</Text>
                    <TouchableOpacity
                      style={styles.manualKeyBox}
                      onPress={() => copyToClipboard(secret.secret)}
                    >
                      <Text style={styles.manualKeyText}>{secret.manualEntryKey}</Text>
                      <MaterialCommunityIcons name="content-copy" size={20} color={colors.primary[600]} />
                    </TouchableOpacity>
                    <Text style={styles.manualKeyHint}>
                      Tap to copy. Enter this key in your authenticator app.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => setStep('verify')}
                >
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[700]]}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>Continue</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={colors.neutral[0]} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => setStep('info')}>
                  <Text style={styles.backButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'verify' && (
              <>
                <Text style={styles.verifyTitle}>Enter Verification Code</Text>
                <Text style={styles.verifyDescription}>
                  {enabled
                    ? 'Enter the 6-digit code from your authenticator app to disable 2FA.'
                    : 'Enter the 6-digit code from your authenticator app to complete setup.'}
                </Text>

                <View style={styles.codeInputContainer}>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="000000"
                    placeholderTextColor={colors.neutral[300]}
                    value={verificationCode}
                    onChangeText={(text) => setVerificationCode(text.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                <Text style={styles.codeHint}>
                  Code refreshes every 30 seconds
                </Text>

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
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(enabled ? 'info' : 'setup')}
                >
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'recovery' && (
              <>
                <View style={styles.recoveryHeader}>
                  <View style={styles.recoveryIconContainer}>
                    <MaterialCommunityIcons name="shield-check" size={40} color={colors.semantic.success} />
                  </View>
                  <Text style={styles.recoveryTitle}>Save Your Recovery Codes</Text>
                  <Text style={styles.recoveryDescription}>
                    Save these codes in a secure place. You can use them to access your account if you lose your authenticator app.
                  </Text>
                </View>

                <View style={styles.recoveryCodesContainer}>
                  {recoveryCodes.map((code, index) => (
                    <View key={index} style={styles.recoveryCodeItem}>
                      <Text style={styles.recoveryCodeNumber}>{index + 1}.</Text>
                      <Text style={styles.recoveryCodeText}>{code}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.copyCodesButton}
                  onPress={() => copyToClipboard(recoveryCodes.join('\n'))}
                >
                  <MaterialCommunityIcons name="content-copy" size={18} color={colors.primary[600]} />
                  <Text style={styles.copyCodesButtonText}>Copy All Codes</Text>
                </TouchableOpacity>

                <View style={styles.recoveryWarning}>
                  <MaterialCommunityIcons name="alert" size={18} color={colors.accent.gold} />
                  <Text style={styles.recoveryWarningText}>
                    Each code can only be used once. Store them securely!
                  </Text>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleFinish}>
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[700]]}
                    style={styles.submitButtonGradient}
                  >
                    <MaterialCommunityIcons name="check" size={20} color={colors.neutral[0]} />
                    <Text style={styles.submitButtonText}>I've Saved My Codes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

// Theme Option Button
const ThemeOptionButton: React.FC<{
  mode: ThemeMode;
  currentMode: ThemeMode;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}> = ({ mode, currentMode, label, icon, onPress }) => {
  const isActive = currentMode === mode;
  return (
    <TouchableOpacity
      style={[styles.themeOption, isActive && styles.themeOptionActive]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={isActive ? colors.primary[600] : colors.neutral[500]}
      />
      <Text style={[styles.themeOptionText, isActive && styles.themeOptionTextActive]}>
        {label}
      </Text>
      {isActive && (
        <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary[600]} />
      )}
    </TouchableOpacity>
  );
};

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { mode: themeMode, setThemeMode, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

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
            subtitle={themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}
            onPress={() => setThemeModalVisible(true)}
            rightElement={
              <View style={styles.themePreview}>
                <MaterialCommunityIcons
                  name={isDark ? 'weather-night' : 'white-balance-sunny'}
                  size={18}
                  color={isDark ? colors.accent.lavender : colors.accent.gold}
                />
              </View>
            }
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
        userId={user?.id || 'anonymous'}
        userEmail={user?.email || 'user@example.com'}
      />

      {/* Theme Modal */}
      <Modal visible={themeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setThemeModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Appearance</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setThemeModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.themeDescription}>
                Choose how GrowMe looks on your device. You can select Light, Dark, or match your system settings.
              </Text>

              <View style={styles.themeOptions}>
                <ThemeOptionButton
                  mode="light"
                  currentMode={themeMode}
                  label="Light"
                  icon="white-balance-sunny"
                  onPress={() => setThemeMode('light')}
                />
                <ThemeOptionButton
                  mode="dark"
                  currentMode={themeMode}
                  label="Dark"
                  icon="weather-night"
                  onPress={() => setThemeMode('dark')}
                />
                <ThemeOptionButton
                  mode="system"
                  currentMode={themeMode}
                  label="System"
                  icon="cellphone"
                  onPress={() => setThemeMode('system')}
                />
              </View>

              <View style={styles.themePreviewCard}>
                <View style={[styles.themePreviewHalf, { backgroundColor: colors.neutral[0] }]}>
                  <MaterialCommunityIcons name="white-balance-sunny" size={24} color={colors.accent.gold} />
                  <Text style={[styles.themePreviewLabel, { color: colors.neutral[900] }]}>Light</Text>
                </View>
                <View style={[styles.themePreviewHalf, { backgroundColor: colors.neutral[900] }]}>
                  <MaterialCommunityIcons name="weather-night" size={24} color={colors.accent.lavender} />
                  <Text style={[styles.themePreviewLabel, { color: colors.neutral[0] }]}>Dark</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  codeHint: {
    ...typography.caption,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  // Supported Apps
  supportedApps: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  supportedAppsLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
  },
  supportedAppsIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  appBadgeText: {
    ...typography.caption,
    color: colors.neutral[600],
  },

  // Setup Screen
  setupTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  setupDescription: {
    ...typography.footnote,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrCodePlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
  },
  qrCodeHint: {
    ...typography.caption,
    color: colors.neutral[400],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  manualEntryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  manualEntryToggleText: {
    ...typography.footnote,
    color: colors.primary[600],
    fontWeight: '500',
  },
  manualKeyContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  manualKeyLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  manualKeyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  manualKeyText: {
    ...typography.body,
    color: colors.neutral[900],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  manualKeyHint: {
    ...typography.caption,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },

  // Recovery Codes
  recoveryHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  recoveryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.semantic.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recoveryTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  recoveryDescription: {
    ...typography.footnote,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  recoveryCodesContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  recoveryCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  recoveryCodeNumber: {
    ...typography.caption,
    color: colors.neutral[400],
    width: 24,
  },
  recoveryCodeText: {
    ...typography.body,
    color: colors.neutral[900],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  copyCodesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  copyCodesButtonText: {
    ...typography.footnote,
    color: colors.primary[600],
    fontWeight: '600',
  },
  recoveryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent.gold}15`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  recoveryWarningText: {
    ...typography.caption,
    color: colors.neutral[700],
    flex: 1,
  },

  // Theme Modal
  themePreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeDescription: {
    ...typography.footnote,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  themeOptions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    gap: spacing.md,
  },
  themeOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  themeOptionText: {
    ...typography.callout,
    color: colors.neutral[600],
    flex: 1,
  },
  themeOptionTextActive: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  themePreviewCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  themePreviewHalf: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  themePreviewLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
});
