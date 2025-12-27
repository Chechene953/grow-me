import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, shadows, borderRadius } from '../theme';
import { Plant } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_PADDING = spacing.xl;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1.15;

interface PlantCardPremiumProps {
  plant: Plant;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export const PlantCardPremium: React.FC<PlantCardPremiumProps> = ({
  plant,
  onPress,
  onFavorite,
  isFavorite = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  const getImageUrl = () => {
    if (plant.colors && plant.colors.length > 0) {
      const firstColor = plant.colors[0];
      if (firstColor.images && firstColor.images.length > 0) {
        return firstColor.images[0];
      }
    }
    return plant.images?.[0] || '';
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      tension: 150,
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

  const handleFavorite = () => {
    Animated.sequence([
      Animated.spring(heartScaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(heartScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onFavorite?.();
  };

  const careLevelColor = {
    Easy: colors.semantic.success,
    Medium: colors.semantic.warning,
    Hard: colors.semantic.error,
  }[plant.careLevel];

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl() }}
            style={styles.image}
            resizeMode="cover"
          />

          {onFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                <MaterialCommunityIcons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? colors.semantic.error : colors.neutral[0]}
                />
              </Animated.View>
            </TouchableOpacity>
          )}

          <View style={[styles.careBadge, { backgroundColor: careLevelColor }]}>
            <MaterialCommunityIcons name="leaf" size={10} color={colors.neutral[0]} />
            <Text style={styles.careBadgeText}>{plant.careLevel}</Text>
          </View>

          {plant.airPurifying && (
            <View style={styles.airPurifyBadge}>
              <MaterialCommunityIcons name="air-filter" size={12} color={colors.primary[600]} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {plant.name}
          </Text>

          <Text style={styles.category} numberOfLines={1}>
            {plant.category}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.price}>
              <Text style={styles.currencySymbol}>$</Text>
              {plant.basePrice.toFixed(2)}
            </Text>

            <View style={styles.lightBadge}>
              <MaterialCommunityIcons
                name="white-balance-sunny"
                size={11}
                color={colors.accent.gold}
              />
              <Text style={styles.lightText}>{plant.lightPreference}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
    backgroundColor: colors.neutral[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  careBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    gap: 3,
  },
  careBadgeText: {
    fontSize: 9,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  airPurifyBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  category: {
    ...typography.caption,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 17,
    color: colors.primary[700],
    fontWeight: '700',
  },
  currencySymbol: {
    fontSize: 13,
    fontWeight: '500',
  },
  lightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent.gold}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 3,
  },
  lightText: {
    fontSize: 10,
    color: colors.neutral[600],
    fontWeight: '600',
  },
});
