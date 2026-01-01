import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '../theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.4)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

// Order Card Skeleton
export const OrderCardSkeleton: React.FC = () => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <SkeletonLoader width={120} height={20} />
      <SkeletonLoader width={80} height={24} borderRadius={12} />
    </View>
    <SkeletonLoader width={100} height={16} style={{ marginTop: 8 }} />
    <View style={styles.orderItems}>
      <SkeletonLoader width={60} height={60} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonLoader width="80%" height={16} />
        <SkeletonLoader width="50%" height={14} style={{ marginTop: 6 }} />
      </View>
    </View>
    <View style={styles.orderFooter}>
      <SkeletonLoader width={80} height={16} />
      <SkeletonLoader width={60} height={20} />
    </View>
  </View>
);

// Plant Card Skeleton
export const PlantCardSkeleton: React.FC = () => (
  <View style={styles.plantCard}>
    <SkeletonLoader width="100%" height={140} borderRadius={16} />
    <SkeletonLoader width="70%" height={18} style={{ marginTop: 12 }} />
    <SkeletonLoader width="40%" height={14} style={{ marginTop: 6 }} />
    <SkeletonLoader width="30%" height={20} style={{ marginTop: 8 }} />
  </View>
);

// Profile Menu Skeleton
export const ProfileMenuSkeleton: React.FC = () => (
  <View style={styles.menuCard}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.menuItem}>
        <SkeletonLoader width={40} height={40} borderRadius={12} />
        <SkeletonLoader width="60%" height={18} style={{ marginLeft: 12 }} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    width: 300,
  },
  orderCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  plantCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: 12,
    width: '48%',
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
});
