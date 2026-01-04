import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, typography, spacing, borderRadius } from '../theme';

interface PremiumHeaderProps {
  userName?: string;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  userName = 'there',
  onNotificationPress,
  notificationCount = 0,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, backgroundColor: colors.neutral[0] }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: colors.primary[50] }]}>
              <MaterialCommunityIcons name="leaf" size={22} color={colors.primary[600]} />
            </View>
            <Text style={[styles.logoText, { color: colors.neutral[900] }]}>GrowMe</Text>
          </View>

          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingText, { color: colors.neutral[500] }]}>{getGreeting()}, </Text>
            <Text style={[styles.nameText, { color: colors.neutral[800] }]}>{firstName}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {onNotificationPress && (
            <TouchableOpacity
              style={[styles.notificationButton, { backgroundColor: colors.neutral[100] }]}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color={colors.neutral[700]}
              />
              {notificationCount > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.semantic.error }]}>
                  <Text style={[styles.notificationBadgeText, { color: colors.neutral[0] }]}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary[500] }]}>
              <Text style={[styles.avatarInitial, { color: colors.neutral[0] }]}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.onlineIndicator, { backgroundColor: colors.semantic.success, borderColor: colors.neutral[0] }]} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.subtitle, { color: colors.neutral[500] }]}>Find your perfect plant</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultColors.neutral[0],
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: defaultColors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    fontSize: 18,
    color: defaultColors.primary[700],
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greetingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  greetingText: {
    ...typography.title1,
    color: defaultColors.neutral[500],
    fontWeight: '400',
  },
  nameText: {
    ...typography.title1,
    color: defaultColors.neutral[900],
    fontWeight: '700',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.lg,
    backgroundColor: defaultColors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: defaultColors.semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 9,
    color: defaultColors.neutral[0],
    fontWeight: '700',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: defaultColors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: defaultColors.primary[200],
  },
  avatarInitial: {
    fontSize: 18,
    color: defaultColors.primary[700],
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: defaultColors.semantic.success,
    borderWidth: 2,
    borderColor: defaultColors.neutral[0],
  },
  subtitle: {
    ...typography.callout,
    color: defaultColors.neutral[400],
    marginTop: spacing.sm,
  },
});
