import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography, borderRadius } from '../theme';

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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
        style={styles.backButton}
        onPress={() => navigation.goBack()}
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
      style={styles.actionButton}
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
        {showBackButton && navigation.canGoBack() ? (
          <BackButton />
        ) : leftAction ? (
          <ActionButton icon={leftAction.icon} onPress={leftAction.onPress} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
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
      tint="light"
      style={styles.blurContainer}
    >
      <View style={styles.blurOverlay} />
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
    color: colors.neutral[900],
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
});
