import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, spacing, typography, borderRadius } from '../theme';

interface ModernHeaderProps {
  title?: string;
  showBackButton?: boolean;
  transparent?: boolean;
  rightAction?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
  };
  leftAction?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
  };
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  showBackButton = true,
  transparent = false,
  rightAction,
  leftAction,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { colors, isDark } = useTheme();

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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

  const BackButton = () => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.primary[50] }]}
        onPress={() => router.back()}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={28}
          color={colors.primary[700]}
        />
      </TouchableOpacity>
    </Animated.View>
  );

  const ActionButton = ({ icon, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: colors.neutral[100] }]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={colors.neutral[700]}
      />
    </TouchableOpacity>
  );

  const headerContent = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.leftContainer}>
        {showBackButton ? (
          <BackButton />
        ) : leftAction ? (
          <ActionButton icon={leftAction.icon} onPress={leftAction.onPress} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.neutral[900] }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      <View style={styles.rightContainer}>
        {rightAction ? (
          <ActionButton icon={rightAction.icon} onPress={rightAction.onPress} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );

  if (transparent) {
    return (
      <View style={styles.transparentContainer}>
        {headerContent}
      </View>
    );
  }

  return (
    <BlurView
      intensity={Platform.OS === 'ios' ? 80 : 100}
      tint={isDark ? 'dark' : 'light'}
      style={[styles.blurContainer, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}
    >
      <View style={[styles.blurOverlay, { backgroundColor: isDark ? 'rgba(18, 18, 18, 0.92)' : 'rgba(255, 255, 255, 0.92)' }]} />
      {headerContent}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  transparentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.92)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 56,
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.title3,
    color: defaultColors.neutral[900],
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: defaultColors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: defaultColors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
});
