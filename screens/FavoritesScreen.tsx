import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { useAuthStore } from '../stores/authStore';
import { usePlantStore } from '../stores/plantStore';
import { favoriteService } from '../services/favoriteService';
import { Plant } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, spacing, borderRadius, typography, shadows } from '../theme';
import { SkeletonLoader, PlantCardSkeleton } from '../components/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2;

// Animated Heart Button
const AnimatedHeartButton: React.FC<{
  onPress: () => void;
  isFavorite: boolean;
}> = ({ onPress, isFavorite }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.7,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.heartButton}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <BlurView intensity={80} tint="light" style={styles.heartBlur}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? defaultColors.semantic.error : defaultColors.neutral[600]}
          />
        </Animated.View>
      </BlurView>
    </TouchableOpacity>
  );
};

// Premium Favorite Card
const FavoriteCard: React.FC<{
  plant: Plant;
  onPress: () => void;
  onRemove: () => void;
  index: number;
}> = ({ plant, onPress, onRemove, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const careLevelColor = {
    Easy: defaultColors.semantic.success,
    Medium: defaultColors.semantic.warning,
    Hard: defaultColors.semantic.error,
  }[plant.careLevel];

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: scaleAnim,
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageError ? (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="flower-tulip"
                size={40}
                color={defaultColors.neutral[300]}
              />
            </View>
          ) : (
            <Image
              source={{ uri: plant.images[0] }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          />

          {/* Heart Button */}
          <AnimatedHeartButton onPress={onRemove} isFavorite={true} />

          {/* Care Level Badge */}
          <View style={[styles.careBadge, { backgroundColor: careLevelColor }]}>
            <Text style={styles.careBadgeText}>{plant.careLevel}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.plantName} numberOfLines={1}>
            {plant.name}
          </Text>
          <Text style={styles.plantCategory} numberOfLines={1}>
            {plant.category}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${plant.basePrice.toFixed(2)}</Text>
            {plant.airPurifying && (
              <View style={styles.airBadge}>
                <MaterialCommunityIcons
                  name="air-filter"
                  size={12}
                  color={defaultColors.primary[600]}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Empty State Component
const EmptyFavorites: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
          <LinearGradient
            colors={[defaultColors.primary[100], defaultColors.primary[50]]}
            style={styles.emptyIconBg}
          >
            <MaterialCommunityIcons
              name="heart-outline"
              size={64}
              color={defaultColors.primary[400]}
            />
          </LinearGradient>
        </Animated.View>
      </View>
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on any plant to save it here for quick access
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={onExplore}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[defaultColors.primary[500], defaultColors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.exploreButtonGradient}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={defaultColors.neutral[0]}
          />
          <Text style={styles.exploreButtonText}>Explore Plants</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Loading Skeleton
const FavoritesLoading: React.FC = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingGrid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <SkeletonLoader width="100%" height={140} borderRadius={16} />
          <SkeletonLoader width="80%" height={18} style={{ marginTop: 12 }} />
          <SkeletonLoader width="50%" height={14} style={{ marginTop: 6 }} />
          <SkeletonLoader width="40%" height={20} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  </View>
);

export const FavoritesScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { getAllPlants } = usePlantStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [favoritePlants, setFavoritePlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user?.favorites || user.favorites.length === 0) {
      setFavoritePlants([]);
      setLoading(false);
      return;
    }

    try {
      const allPlants = await getAllPlants();
      const favorites = allPlants.filter((plant: Plant) =>
        user.favorites.includes(plant.id)
      );
      setFavoritePlants(favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await useAuthStore.getState().loadUser();
    await loadFavorites();
    setRefreshing(false);
  }, []);

  const handlePlantPress = (plantId: string) => {
    router.push(`/plant/${plantId}`);
  };

  const handleRemoveFavorite = async (plant: Plant) => {
    if (!user) return;

    Alert.alert(
      'Remove from Favorites',
      `Remove ${plant.name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            try {
              await favoriteService.toggleFavorite(user.id, plant.id, true);
              await useAuthStore.getState().loadUser();
              // Immediately update local state for smooth UX
              setFavoritePlants((prev) =>
                prev.filter((p) => p.id !== plant.id)
              );
            } catch (error) {
              console.error('Failed to remove favorite:', error);
            }
          },
        },
      ]
    );
  };

  const handleExplore = () => {
    router.push('/(tabs)');
  };

  const renderItem = ({ item, index }: { item: Plant; index: number }) => (
    <FavoriteCard
      plant={item}
      onPress={() => handlePlantPress(item.id)}
      onRemove={() => handleRemoveFavorite(item)}
      index={index}
    />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ModernHeader title="Favorites" />
        <FavoritesLoading />
      </View>
    );
  }

  if (favoritePlants.length === 0) {
    return (
      <View style={styles.container}>
        <ModernHeader title="Favorites" />
        <EmptyFavorites onExplore={handleExplore} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <ModernHeader title="Favorites" />

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.neutral[0] }]}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name="heart"
            size={18}
            color={colors.semantic.error}
          />
          <Text style={[styles.statText, { color: colors.neutral[600] }]}>
            {favoritePlants.length} {favoritePlants.length === 1 ? 'Plant' : 'Plants'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Could add sorting options here
          }}
        >
          <MaterialCommunityIcons
            name="sort-variant"
            size={18}
            color={colors.neutral[600]}
          />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={favoritePlants}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[600]}
            colors={[colors.primary[600]]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultColors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.xl,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: defaultColors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.neutral[100],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.callout,
    fontWeight: '600',
    color: defaultColors.neutral[800],
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: defaultColors.neutral[100],
    borderRadius: borderRadius.lg,
  },
  sortText: {
    ...typography.footnote,
    fontWeight: '600',
    color: defaultColors.neutral[600],
  },

  // List
  listContent: {
    padding: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },

  // Card
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    backgroundColor: defaultColors.neutral[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: defaultColors.neutral[100],
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  heartBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  careBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  careBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: defaultColors.neutral[0],
  },
  cardContent: {
    padding: spacing.md,
  },
  plantName: {
    ...typography.callout,
    fontWeight: '700',
    color: defaultColors.neutral[900],
    marginBottom: 2,
  },
  plantCategory: {
    ...typography.footnote,
    color: defaultColors.neutral[500],
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    ...typography.callout,
    fontWeight: '800',
    color: defaultColors.primary[700],
  },
  airBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: defaultColors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyIconContainer: {
    marginBottom: spacing.xl,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.title2,
    color: defaultColors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: defaultColors.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  exploreButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xl + spacing.md,
    gap: spacing.sm,
  },
  exploreButtonText: {
    ...typography.callout,
    fontWeight: '700',
    color: defaultColors.neutral[0],
  },
});
