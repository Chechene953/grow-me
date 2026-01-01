import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useAuthStore } from '../stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

// Tab bar height
const TAB_BAR_HEIGHT = 100;

interface MenuItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, badge, danger }) => {
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.menuIconContainer, danger && styles.menuIconContainerDanger]}>
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={danger ? colors.semantic.error : colors.primary[600]}
          />
        </View>
        <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
          {label}
        </Text>
        {badge !== undefined && badge > 0 && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.neutral[300]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.primary[600], colors.primary[500]]}
        style={[styles.header, { paddingTop: insets.top + spacing.xl }]}
      >
        <View style={styles.avatarContainer}>
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
            <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />
          </View>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </LinearGradient>

      {/* Menu sections */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>My Account</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="package-variant"
            label="My Orders"
            onPress={() => router.push('/orders')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="heart"
            label="Favorites"
            onPress={() => router.push('/favorites')}
            badge={user?.favorites?.length || 0}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="account-edit"
            label="Edit Profile"
            onPress={() => router.push('/edit-profile')}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Plant Care</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="book-open-page-variant"
            label="Care Tips"
            onPress={() => router.push('/care-tips')}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="shield-check"
            label="Subscription & Insurance"
            onPress={() => router.push('/subscription-manage')}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="logout"
            label="Sign Out"
            onPress={handleSignOut}
            danger
          />
        </View>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
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
    backgroundColor: colors.semantic.success,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuIconContainerDanger: {
    backgroundColor: `${colors.semantic.error}15`,
  },
  menuItemText: {
    ...typography.body,
    color: colors.neutral[800],
    flex: 1,
  },
  menuItemTextDanger: {
    color: colors.semantic.error,
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
  menuDivider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginLeft: spacing.md + 40 + spacing.md,
  },
  version: {
    ...typography.caption,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
