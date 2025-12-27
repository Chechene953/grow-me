import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows } from '../theme';

interface LiquidGlassProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  variant?: 'light' | 'dark' | 'ultra';
  borderRadiusSize?: number;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  style,
  intensity = 80,
  variant = 'light',
  borderRadiusSize = borderRadius.xxl,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'dark':
        return [
          'rgba(255, 255, 255, 0.15)',
          'rgba(255, 255, 255, 0.05)',
          'rgba(255, 255, 255, 0.02)',
        ];
      case 'ultra':
        return [
          'rgba(255, 255, 255, 0.35)',
          'rgba(255, 255, 255, 0.15)',
          'rgba(255, 255, 255, 0.08)',
        ];
      default:
        return [
          'rgba(255, 255, 255, 0.5)',
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.1)',
        ];
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'dark':
        return 'rgba(255, 255, 255, 0.2)';
      case 'ultra':
        return 'rgba(255, 255, 255, 0.6)';
      default:
        return 'rgba(255, 255, 255, 0.4)';
    }
  };

  const getInnerBorderColor = () => {
    switch (variant) {
      case 'dark':
        return 'rgba(255, 255, 255, 0.1)';
      case 'ultra':
        return 'rgba(255, 255, 255, 0.4)';
      default:
        return 'rgba(255, 255, 255, 0.3)';
    }
  };

  return (
    <View style={[styles.container, { borderRadius: borderRadiusSize }, style]}>
      {/* Outer glow shadow */}
      <View style={[styles.shadowLayer, { borderRadius: borderRadiusSize }]} />

      {/* Main blur container */}
      <BlurView
        intensity={Platform.OS === 'ios' ? intensity : Math.min(intensity + 20, 100)}
        tint={variant === 'dark' ? 'dark' : 'light'}
        style={[styles.blurContainer, { borderRadius: borderRadiusSize }]}
      >
        {/* Inner gradient for specular highlight effect */}
        <LinearGradient
          colors={getGradientColors() as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: borderRadiusSize - 1 }]}
        />

        {/* Top edge highlight for liquid glass look */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.6)',
            'rgba(255, 255, 255, 0.0)',
          ]}
          style={[styles.topHighlight, { borderTopLeftRadius: borderRadiusSize - 1, borderTopRightRadius: borderRadiusSize - 1 }]}
        />

        {/* Inner border */}
        <View
          style={[
            styles.innerBorder,
            {
              borderRadius: borderRadiusSize - 2,
              borderColor: getInnerBorderColor(),
            }
          ]}
        />

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>

      {/* Outer border */}
      <View
        style={[
          styles.outerBorder,
          {
            borderRadius: borderRadiusSize,
            borderColor: getBorderColor(),
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  shadowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    ...shadows.lg,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  blurContainer: {
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.85)',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    margin: 1,
    pointerEvents: 'none',
  },
  outerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
