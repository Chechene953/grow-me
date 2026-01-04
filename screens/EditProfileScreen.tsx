import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ModernHeader } from '../components/ModernHeader';
import { PremiumPicker, COUNTRIES, getStatesForCountry } from '../components/PremiumPicker';
import { useAuthStore } from '../stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';

export const EditProfileScreen = () => {
  const { user, updateProfile } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [stateValue, setStateValue] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [countryCode, setCountryCode] = useState('US');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const avatarScaleAnim = useRef(new Animated.Value(1)).current;

  const getCountryName = (code: string): string => {
    const country = COUNTRIES.find((c) => c.value === code);
    return country?.label || 'United States';
  };

  const getStateName = (stateCode: string, countryCode: string): string => {
    const states = getStatesForCountry(countryCode);
    const state = states.find((s) => s.value === stateCode);
    return state?.label || stateCode;
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Needed',
        'Please grant camera roll permissions to upload an image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Animate avatar change
      Animated.sequence([
        Animated.timing(avatarScaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(avatarScaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Required Field', 'Please enter your name');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateProfile({
        name: name.trim(),
        address: {
          street,
          city,
          state: stateValue,
          zipCode,
          country: getCountryName(countryCode),
        },
        avatar: avatar || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const states = getStatesForCountry(countryCode);

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <ModernHeader title="Edit Profile" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
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
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.9}
              style={styles.avatarTouchable}
            >
              <Animated.View
                style={[
                  styles.avatarContainer,
                  { transform: [{ scale: avatarScaleAnim }] },
                ]}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <LinearGradient
                    colors={[colors.primary[300], colors.primary[500]]}
                    style={styles.avatarPlaceholder}
                  >
                    <MaterialCommunityIcons
                      name="account"
                      size={48}
                      color={colors.neutral[0]}
                    />
                  </LinearGradient>
                )}
                <View style={styles.cameraButton}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={16}
                    color={colors.neutral[0]}
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Personal Information */}
          <View style={[styles.section, { backgroundColor: colors.neutral[0] }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary[50] }]}>
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={20}
                  color={colors.primary[600]}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.neutral[800] }]}>Personal Information</Text>
            </View>

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              icon="account-outline"
            />

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              icon="email-outline"
              editable={false}
              style={styles.disabledInput}
            />
            <View style={styles.infoNote}>
              <MaterialCommunityIcons
                name="information-outline"
                size={14}
                color={colors.neutral[400]}
              />
              <Text style={styles.infoNoteText}>
                Email is linked to your account and cannot be changed
              </Text>
            </View>

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              icon="phone-outline"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View style={[styles.section, { backgroundColor: colors.neutral[0] }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary[50] }]}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={20}
                  color={colors.primary[600]}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.neutral[800] }]}>Delivery Address</Text>
            </View>

            <Input
              label="Street Address"
              placeholder="Enter street address"
              value={street}
              onChangeText={setStreet}
              icon="home-outline"
            />

            <Input
              label="Apartment, Suite, etc. (optional)"
              placeholder="Apt, Suite, Unit, Building"
              value=""
              onChangeText={() => {}}
              icon="door"
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  label="City"
                  placeholder="Enter city"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={styles.flex1}>
                <Input
                  label="ZIP / Postal Code"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <PremiumPicker
              label="Country"
              value={countryCode}
              options={COUNTRIES}
              onValueChange={(value) => {
                setCountryCode(value);
                setStateValue(''); // Reset state when country changes
              }}
              placeholder="Select country"
              searchable
              icon="earth"
            />

            {states.length > 0 && (
              <PremiumPicker
                label={countryCode === 'CA' ? 'Province' : 'State'}
                value={stateValue}
                options={states}
                onValueChange={setStateValue}
                placeholder={`Select ${countryCode === 'CA' ? 'province' : 'state'}`}
                searchable
                icon="map-marker"
              />
            )}
          </View>

          {/* Password Section */}
          <View style={[styles.section, { backgroundColor: colors.neutral[0] }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary[50] }]}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={colors.primary[600]}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.neutral[800] }]}>Security</Text>
            </View>

            <TouchableOpacity
              style={styles.securityItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Change Password', 'Password change coming soon!');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.securityItemLeft}>
                <MaterialCommunityIcons
                  name="key-outline"
                  size={22}
                  color={colors.neutral[600]}
                />
                <View style={styles.securityItemText}>
                  <Text style={styles.securityItemTitle}>Change Password</Text>
                  <Text style={styles.securityItemSubtitle}>
                    Update your account password
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.neutral[300]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.securityItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Two-Factor Auth', '2FA setup coming soon!');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.securityItemLeft}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={22}
                  color={colors.neutral[600]}
                />
                <View style={styles.securityItemText}>
                  <Text style={styles.securityItemTitle}>
                    Two-Factor Authentication
                  </Text>
                  <Text style={styles.securityItemSubtitle}>
                    Add extra security to your account
                  </Text>
                </View>
              </View>
              <View style={styles.securityBadge}>
                <Text style={styles.securityBadgeText}>Off</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                loading
                  ? [colors.neutral[400], colors.neutral[500]]
                  : [colors.primary[500], colors.primary[700]]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              {loading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={colors.neutral[0]}
                  />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () =>
                      Alert.alert('Coming Soon', 'Account deletion coming soon'),
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={18}
              color={colors.semantic.error}
            />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
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
    padding: spacing.xl,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.neutral[0],
    ...shadows.md,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.neutral[0],
    ...shadows.md,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.neutral[0],
  },
  avatarHint: {
    ...typography.footnote,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },

  // Sections
  section: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.neutral[900],
  },

  // Input Styles
  disabledInput: {
    opacity: 0.6,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  infoNoteText: {
    ...typography.caption,
    color: colors.neutral[400],
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },

  // Security Section
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  securityItemText: {
    flex: 1,
  },
  securityItemTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  securityItemSubtitle: {
    ...typography.footnote,
    color: colors.neutral[500],
    marginTop: 2,
  },
  securityBadge: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  securityBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[600],
  },

  // Save Button
  saveButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 4,
    gap: spacing.sm,
  },
  saveButtonText: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[0],
  },

  // Danger Button
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  dangerButtonText: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.semantic.error,
  },
});
