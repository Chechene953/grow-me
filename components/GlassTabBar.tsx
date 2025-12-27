import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, shadows, spacing, borderRadius } from '../theme';

interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const getIconName = (routeName: string, isFocused: boolean): string => {
  const icons: Record<string, { active: string; inactive: string }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    Cart: { active: 'cart', inactive: 'cart-outline' },
    Profile: { active: 'account-circle', inactive: 'account-circle-outline' },
  };

  return icons[routeName]?.[isFocused ? 'active' : 'inactive'] || 'help-circle';
};

interface TabItemProps {
  iconName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  badgeCount?: number;
}

const TabItem: React.FC<TabItemProps> = ({
  iconName,
  isFocused,
  onPress,
  onLongPress,
  badgeCount,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.1 : 1,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.iconBackground, { opacity: bgOpacity }]} />
        <MaterialCommunityIcons
          name={iconName as any}
          size={26}
          color={isFocused ? colors.primary[600] : colors.neutral[400]}
        />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const GlassTabBar: React.FC<GlassTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.sm);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {/* Shadow layer */}
      <View style={styles.shadowContainer}>
        <View style={styles.shadow} />
      </View>

      {/* Main glass container */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 90 : 100}
        tint="light"
        style={styles.blurContainer}
      >
        {/* Gradient overlay for glass effect */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.6)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.15)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        />

        {/* Top highlight for liquid glass effect */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.8)',
            'rgba(255, 255, 255, 0.0)',
          ]}
          style={styles.topHighlight}
        />

        {/* Tab items */}
        <View style={styles.tabContainer}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const iconName = getIconName(route.name, isFocused);
            const badgeCount = options.tabBarBadge;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                iconName={iconName}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                badgeCount={badgeCount}
              />
            );
          })}
        </View>

        {/* Inner border */}
        <View style={styles.innerBorder} />
      </BlurView>

      {/* Outer border */}
      <View style={styles.outerBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    zIndex: 100,
  },
  shadowContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.lg,
    right: spacing.lg,
    height: 70,
    borderRadius: 35,
  },
  shadow: {
    flex: 1,
    borderRadius: 35,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  blurContainer: {
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.92)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    margin: 1,
    pointerEvents: 'none',
  },
  outerBorder: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    pointerEvents: 'none',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
  },
  iconBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: colors.primary[50],
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.neutral[0],
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[0],
  },
});
