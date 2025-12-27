import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, Text, LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';

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
  onLayout: (event: LayoutChangeEvent) => void;
  badgeCount?: number;
}

const TabItem: React.FC<TabItemProps> = ({
  iconName,
  isFocused,
  onPress,
  onLongPress,
  onLayout,
  badgeCount,
}) => {
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

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={onLayout}
      activeOpacity={1}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
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

  // Animated values for liquid slider
  const sliderPosition = useRef(new Animated.Value(0)).current;
  const sliderScale = useRef(new Animated.Value(1)).current;
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);

  // Update slider position when tab changes
  useEffect(() => {
    if (tabLayouts.length > 0 && tabLayouts[state.index]) {
      const targetX = tabLayouts[state.index].x + (tabLayouts[state.index].width / 2) - 32;

      // Scale animation for liquid effect
      Animated.sequence([
        Animated.timing(sliderScale, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(sliderPosition, {
            toValue: targetX,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.spring(sliderScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [state.index, tabLayouts]);

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width };
      return newLayouts;
    });
  };

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

        {/* Liquid slider indicator */}
        {tabLayouts.length > 0 && (
          <Animated.View
            style={[
              styles.liquidSlider,
              {
                transform: [
                  { translateX: sliderPosition },
                  { scaleX: sliderScale },
                  { scaleY: Animated.multiply(sliderScale, 0.95) },
                ],
              },
            ]}
          >
            {/* Slider glass effect layers */}
            <BlurView
              intensity={Platform.OS === 'ios' ? 20 : 40}
              tint="light"
              style={styles.sliderBlur}
            />
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.9)',
                'rgba(255, 255, 255, 0.6)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.sliderGradient}
            />
            {/* Specular highlight */}
            <View style={styles.sliderSpecular} />
            {/* Inner glow */}
            <LinearGradient
              colors={[
                `${colors.primary[400]}30`,
                'transparent',
              ]}
              style={styles.sliderInnerGlow}
            />
          </Animated.View>
        )}

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
                onLayout={(e) => handleTabLayout(index, e)}
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
  liquidSlider: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 64,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 30, 63, 0.15)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sliderBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
  },
  sliderGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
  },
  sliderSpecular: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.6)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
    }),
  },
  sliderInnerGlow: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: '50%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    zIndex: 2,
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
