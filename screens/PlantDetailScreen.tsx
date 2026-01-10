import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  FlatList,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '../components/Button';
import { usePlantStore } from '../stores/plantStore';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { favoriteService } from '../services/favoriteService';
import { Plant, PlantSize, PotColor, Accessory, CartItem } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARViewerScreen } from './ARViewerScreen';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface PlantDetailScreenProps {
  plantId: string;
}

const AVAILABLE_ACCESSORIES: Accessory[] = [
  { id: '1', name: 'Decorative Stones', description: 'Premium river stones for elegant finish', price: 5.99, image: 'stones' },
  { id: '2', name: 'Self-Watering System', description: 'Never forget to water again', price: 19.99, image: 'water' },
  { id: '3', name: 'Plant Food', description: 'Organic slow-release fertilizer', price: 8.99, image: 'food' },
  { id: '4', name: 'Moss Cover', description: 'Decorative moss topping', price: 7.99, image: 'moss' },
];

const ACCESSORY_ICONS: Record<string, string> = {
  stones: 'diamond-stone',
  water: 'water-pump',
  food: 'leaf-circle',
  moss: 'grass',
};

const SIZE_INFO: Record<PlantSize, { label: string; height: string; pot: string; icon: string }> = {
  Small: { label: 'Small', height: '15-25cm', pot: '10cm pot', icon: 'size-s' },
  Medium: { label: 'Medium', height: '30-45cm', pot: '15cm pot', icon: 'size-m' },
  Large: { label: 'Large', height: '50-80cm', pot: '20cm pot', icon: 'size-l' },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated Option Card Component
const AnimatedOptionCard: React.FC<{
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}> = ({ selected, onPress, children, style }) => {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.96 : 1 }] }]}
    >
      <View
        style={[
          style,
          {
            borderColor: selected ? colors.primary[500] : colors.neutral[200],
            backgroundColor: selected ? colors.primary[50] : colors.neutral[0],
          },
        ]}
      >
        {children}
      </View>
    </Pressable>
  );
};

// Quantity Selector Component
const QuantitySelector: React.FC<{
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}> = ({ quantity, onChange, max = 10 }) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(quantity + 1);
    }
  };

  return (
    <View style={styles.quantityContainer}>
      <Text style={styles.quantityLabel}>Quantity</Text>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]}
          onPress={handleDecrease}
          disabled={quantity <= 1}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="minus"
            size={20}
            color={quantity <= 1 ? colors.neutral[300] : colors.primary[600]}
          />
        </TouchableOpacity>
        <View style={styles.quantityValue}>
          <Text style={styles.quantityText}>{quantity}</Text>
        </View>
        <TouchableOpacity
          style={[styles.quantityBtn, quantity >= max && styles.quantityBtnDisabled]}
          onPress={handleIncrease}
          disabled={quantity >= max}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={quantity >= max ? colors.neutral[300] : colors.primary[600]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Premium Size Selector
const SizeSelector: React.FC<{
  sizes: PlantSize[];
  selected: PlantSize;
  onSelect: (size: PlantSize) => void;
  basePrice: number;
}> = ({ sizes, selected, onSelect, basePrice }) => {
  const sizeModifiers = { Small: 0.8, Medium: 1, Large: 1.5 };

  return (
    <View style={styles.sizeSelectorContainer}>
      {sizes.map((size) => {
        const info = SIZE_INFO[size];
        const price = basePrice * sizeModifiers[size];
        const isSelected = selected === size;

        return (
          <AnimatedOptionCard
            key={size}
            selected={isSelected}
            onPress={() => onSelect(size)}
            style={styles.sizeCard}
          >
            <View style={styles.sizeIconContainer}>
              <View style={[styles.sizeIconCircle, isSelected && styles.sizeIconCircleSelected]}>
                <MaterialCommunityIcons
                  name={size === 'Small' ? 'pot-outline' : size === 'Medium' ? 'pot' : 'pot-mix-outline'}
                  size={24}
                  color={isSelected ? colors.primary[600] : colors.neutral[500]}
                />
              </View>
            </View>
            <Text style={[styles.sizeName, isSelected && styles.sizeNameSelected]}>{info.label}</Text>
            <Text style={styles.sizeHeight}>{info.height}</Text>
            <Text style={styles.sizePot}>{info.pot}</Text>
            <View style={styles.sizePriceTag}>
              <Text style={[styles.sizePrice, isSelected && styles.sizePriceSelected]}>
                ${price.toFixed(0)}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary[600]} />
              </View>
            )}
          </AnimatedOptionCard>
        );
      })}
    </View>
  );
};

// Premium Pot Color Selector
const PotColorSelector: React.FC<{
  colors: PotColor[];
  selected: PotColor | null;
  onSelect: (color: PotColor) => void;
}> = ({ colors: potColors, selected, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.colorScrollContent}
    >
      {potColors.map((color) => {
        const isSelected = selected?.name === color.name;

        return (
          <AnimatedOptionCard
            key={color.name}
            selected={isSelected}
            onPress={() => onSelect(color)}
            style={styles.colorCard}
          >
            <View style={styles.colorPreviewContainer}>
              <View style={[styles.colorPreview, { backgroundColor: color.hexCode }]}>
                {isSelected && (
                  <View style={styles.colorCheckmark}>
                    <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />
                  </View>
                )}
              </View>
              <View style={[styles.colorShadow, { backgroundColor: color.hexCode }]} />
            </View>
            <Text style={[styles.colorName, isSelected && styles.colorNameSelected]}>
              {color.name}
            </Text>
            <View style={styles.materialTag}>
              <Text style={styles.materialText}>{color.material}</Text>
            </View>
            {color.priceModifier > 0 && (
              <Text style={styles.colorModifier}>+${color.priceModifier}</Text>
            )}
          </AnimatedOptionCard>
        );
      })}
    </ScrollView>
  );
};

// Premium Accessory Item
const AccessoryItem: React.FC<{
  accessory: Accessory;
  selected: boolean;
  onToggle: () => void;
}> = ({ accessory, selected, onToggle }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const iconName = ACCESSORY_ICONS[accessory.image || ''] || 'package-variant';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
    >
      <View style={[styles.accessoryCard, selected && styles.accessoryCardSelected]}>
        <View style={[styles.accessoryIconContainer, selected && styles.accessoryIconContainerSelected]}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={24}
            color={selected ? colors.primary[600] : colors.neutral[500]}
          />
        </View>
        <View style={styles.accessoryInfo}>
          <Text style={[styles.accessoryTitle, selected && styles.accessoryTitleSelected]}>
            {accessory.name}
          </Text>
          <Text style={styles.accessoryDesc}>{accessory.description}</Text>
        </View>
        <View style={styles.accessoryRight}>
          <Text style={[styles.accessoryPriceText, selected && styles.accessoryPriceTextSelected]}>
            +${accessory.price.toFixed(2)}
          </Text>
          <View style={[styles.accessoryCheck, selected && styles.accessoryCheckSelected]}>
            {selected && <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

// Loading Skeleton
const PlantDetailSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <SkeletonLoader width="100%" height={360} borderRadius={0} />
    <View style={styles.skeletonContent}>
      <SkeletonLoader width="70%" height={32} />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <SkeletonLoader width={100} height={28} borderRadius={14} />
        <SkeletonLoader width={80} height={28} borderRadius={14} />
      </View>
      <SkeletonLoader width="100%" height={60} style={{ marginTop: 16 }} />
      <SkeletonLoader width={120} height={24} style={{ marginTop: 24 }} />
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <SkeletonLoader width="31%" height={140} borderRadius={16} />
        <SkeletonLoader width="31%" height={140} borderRadius={16} />
        <SkeletonLoader width="31%" height={140} borderRadius={16} />
      </View>
      <SkeletonLoader width={120} height={24} style={{ marginTop: 24 }} />
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <SkeletonLoader width={100} height={130} borderRadius={16} />
        <SkeletonLoader width={100} height={130} borderRadius={16} />
        <SkeletonLoader width={100} height={130} borderRadius={16} />
      </View>
    </View>
  </View>
);

export const PlantDetailScreen = ({ plantId }: PlantDetailScreenProps) => {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getPlantById } = usePlantStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<PlantSize>('Medium');
  const [selectedPotColor, setSelectedPotColor] = useState<PotColor | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<Accessory[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [arVisible, setArVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const imageCarouselRef = useRef<FlatList>(null);

  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const addToCartAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(1)).current;

  const currentImages = useMemo(() => {
    if (selectedPotColor?.images && selectedPotColor.images.length > 0) {
      return selectedPotColor.images;
    }
    return plant?.images || [];
  }, [selectedPotColor, plant]);

  useEffect(() => {
    loadPlant();
  }, [plantId]);

  useEffect(() => {
    calculatePrice();
  }, [plant, selectedSize, selectedPotColor, selectedAccessories, quantity]);

  useEffect(() => {
    setCurrentImageIndex(0);
    if (imageCarouselRef.current && currentImages.length > 0) {
      try {
        imageCarouselRef.current.scrollToIndex({ index: 0, animated: false });
      } catch (e) {}
    }
  }, [selectedPotColor?.name]);

  const loadPlant = async () => {
    setLoading(true);
    const plantData = await getPlantById(plantId);
    if (plantData) {
      setPlant(plantData);
      setSelectedPotColor(plantData.colors[0] || null);
      setIsFavorite(user?.favorites?.includes(plantId) || false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      setIsFavorite(user.favorites?.includes(plantId) || false);
    }
  }, [user, plantId]);

  const calculatePrice = useCallback(() => {
    if (!plant) return;

    let price = plant.basePrice;
    const sizeModifiers = { Small: 0.8, Medium: 1, Large: 1.5 };
    price *= sizeModifiers[selectedSize];

    if (selectedPotColor) {
      price += selectedPotColor.priceModifier;
    }

    selectedAccessories.forEach((acc) => {
      price += acc.price;
    });

    price *= quantity;

    // Animate price change
    Animated.sequence([
      Animated.timing(priceAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.spring(priceAnim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start();

    setCurrentPrice(price);
  }, [plant, selectedSize, selectedPotColor, selectedAccessories, quantity]);

  const toggleAccessory = (accessory: Accessory) => {
    setSelectedAccessories((prev) =>
      prev.find((a) => a.id === accessory.id)
        ? prev.filter((a) => a.id !== accessory.id)
        : [...prev, accessory]
    );
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to add favorites');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.spring(heartScaleAnim, {
        toValue: 1.4,
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

    try {
      await favoriteService.toggleFavorite(user.id, plantId, isFavorite);
      setIsFavorite(!isFavorite);
      await useAuthStore.getState().loadUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleAddToCart = async () => {
    if (!plant || !selectedPotColor) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Select Options', 'Please select a pot color');
      return;
    }

    setAddingToCart(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate button
    Animated.sequence([
      Animated.timing(addToCartAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(addToCartAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    const cartItem: CartItem = {
      plantId: plant.id,
      plant,
      size: selectedSize,
      potColor: selectedPotColor,
      accessories: selectedAccessories,
      quantity,
      price: currentPrice,
    };

    addItem(cartItem);

    setTimeout(() => {
      setAddingToCart(false);
      Alert.alert(
        'Added to Cart',
        `${quantity}x ${plant.name} (${selectedSize}) added to your cart`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
        ]
      );
    }, 400);
  };

  if (loading) {
    return <PlantDetailSkeleton />;
  }

  if (!plant) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="flower-tulip-outline" size={64} color={colors.neutral[300]} />
        <Text style={styles.errorText}>Plant not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const ImageSlide = ({ item, width }: { item: string; width: number }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <View style={[styles.imageSlide, { width }]}>
        {imageError ? (
          <View style={[styles.image, styles.imageError]}>
            <MaterialCommunityIcons name="image-off" size={48} color={colors.neutral[300]} />
            <Text style={styles.imageErrorText}>Image not available</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}
      </View>
    );
  };

  const renderImageItem = ({ item }: { item: string }) => (
    <ImageSlide item={item} width={SCREEN_WIDTH} />
  );

  const careLevelColor = {
    Easy: colors.semantic.success,
    Medium: colors.semantic.warning,
    Hard: colors.semantic.error,
  }[plant.careLevel];

  const unitPrice = currentPrice / quantity;

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={imageCarouselRef}
            data={currentImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `image-${index}-${item}`}
            extraData={currentImages.length}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
            style={styles.imageCarousel}
          />

          {/* Image Indicators */}
          {currentImages.length > 1 && (
            <View style={styles.imageIndicators}>
              {currentImages.map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Navigation Arrows */}
          {currentImages.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.navArrowLeft]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    const prevIndex = currentImageIndex - 1;
                    setCurrentImageIndex(prevIndex);
                    imageCarouselRef.current?.scrollToIndex({ index: prevIndex, animated: true });
                  }}
                >
                  <BlurView intensity={80} tint="dark" style={styles.navArrowBlur}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={colors.neutral[0]} />
                  </BlurView>
                </TouchableOpacity>
              )}
              {currentImageIndex < currentImages.length - 1 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.navArrowRight]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    const nextIndex = currentImageIndex + 1;
                    setCurrentImageIndex(nextIndex);
                    imageCarouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                  }}
                >
                  <BlurView intensity={80} tint="dark" style={styles.navArrowBlur}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.neutral[0]} />
                  </BlurView>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + spacing.sm }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <BlurView intensity={Platform.OS === 'ios' ? 60 : 80} tint="light" style={styles.headerBtnBlur}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={colors.primary[700]} />
            </BlurView>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={[styles.shareButton, { top: insets.top + spacing.sm }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Share', 'Share functionality coming soon!');
            }}
            activeOpacity={0.8}
          >
            <BlurView intensity={Platform.OS === 'ios' ? 60 : 80} tint="light" style={styles.headerBtnBlur}>
              <MaterialCommunityIcons name="share-variant-outline" size={22} color={colors.primary[700]} />
            </BlurView>
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity
            style={[styles.favoriteButton, { top: insets.top + spacing.sm }]}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <BlurView intensity={Platform.OS === 'ios' ? 60 : 80} tint="light" style={styles.headerBtnBlur}>
              <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                <MaterialCommunityIcons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? colors.semantic.error : colors.primary[700]}
                />
              </Animated.View>
            </BlurView>
          </TouchableOpacity>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: careLevelColor }]}>
              <MaterialCommunityIcons name="leaf" size={12} color={colors.neutral[0]} />
              <Text style={styles.badgeText}>{plant.careLevel} Care</Text>
            </View>
            {plant.airPurifying && (
              <View style={[styles.badge, { backgroundColor: colors.primary[600] }]}>
                <MaterialCommunityIcons name="air-filter" size={12} color={colors.neutral[0]} />
                <Text style={styles.badgeText}>Air Purifying</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.neutral[0] }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.name, { color: colors.neutral[900] }]}>{plant.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={18} color={colors.accent.gold} />
              <Text style={[styles.ratingText, { color: colors.neutral[900] }]}>4.8</Text>
              <Text style={[styles.reviewCount, { color: colors.neutral[500] }]}>(128)</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={[styles.categoryTag, { backgroundColor: colors.primary[50] }]}>
              <Text style={[styles.categoryTagText, { color: colors.primary[700] }]}>{plant.category}</Text>
            </View>
            <View style={[styles.lightTag, { backgroundColor: `${colors.accent.gold}15` }]}>
              <MaterialCommunityIcons name="white-balance-sunny" size={14} color={colors.accent.gold} />
              <Text style={[styles.lightTagText, { color: colors.neutral[700] }]}>{plant.lightPreference} Light</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.neutral[600] }]}>{plant.description}</Text>

          {/* Size Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Select Size</Text>
              <Text style={[styles.sectionHint, { color: colors.neutral[500] }]}>Tap to select</Text>
            </View>
            <SizeSelector
              sizes={plant.sizes}
              selected={selectedSize}
              onSelect={setSelectedSize}
              basePrice={plant.basePrice}
            />
          </View>

          {/* Pot Color Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Pot Color & Material</Text>
              <Text style={[styles.sectionHint, { color: colors.neutral[500] }]}>{plant.colors.length} options</Text>
            </View>
            <PotColorSelector
              colors={plant.colors}
              selected={selectedPotColor}
              onSelect={setSelectedPotColor}
            />
          </View>

          {/* Accessories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Enhance Your Plant</Text>
              <Text style={[styles.sectionHint, { color: colors.neutral[500] }]}>Optional add-ons</Text>
            </View>
            {AVAILABLE_ACCESSORIES.map((accessory) => (
              <AccessoryItem
                key={accessory.id}
                accessory={accessory}
                selected={selectedAccessories.some((a) => a.id === accessory.id)}
                onToggle={() => toggleAccessory(accessory)}
              />
            ))}
          </View>

          {/* Quantity */}
          <View style={styles.section}>
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
          </View>

          {/* AR Button */}
          {(plant.modelGlbUrl || plant.modelUsdzUrl) && (
            <TouchableOpacity
              style={styles.arButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (Platform.OS === 'android' && !plant.modelGlbUrl) {
                  Alert.alert('AR Preview', 'No AR model available for this plant on Android.');
                  return;
                }
                if (Platform.OS === 'ios' && !plant.modelUsdzUrl) {
                  Alert.alert('AR Preview', 'No AR model available for this plant on iOS.');
                  return;
                }
                setArVisible(true);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.arButtonGradient}
              >
                <MaterialCommunityIcons name="augmented-reality" size={24} color={colors.neutral[0]} />
                <Text style={styles.arButtonText}>View in Your Space</Text>
                <View style={styles.arBadge}>
                  <Text style={styles.arBadgeText}>AR</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <BlurView
        intensity={95}
        tint="light"
        style={[styles.footer, { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.md) }]}
      >
        <View style={styles.footerContent}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Total</Text>
            <Animated.View style={{ transform: [{ scale: priceAnim }] }}>
              <Text style={styles.priceValue}>
                <Text style={styles.currencySymbol}>$</Text>
                {currentPrice.toFixed(2)}
              </Text>
            </Animated.View>
            {quantity > 1 && (
              <Text style={styles.unitPrice}>${unitPrice.toFixed(2)} each</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addToCartButton, addingToCart && styles.addToCartButtonLoading]}
            onPress={handleAddToCart}
            disabled={addingToCart}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={addingToCart ? [colors.neutral[400], colors.neutral[500]] : [colors.primary[500], colors.primary[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addToCartGradient}
            >
              <MaterialCommunityIcons
                name={addingToCart ? 'check' : 'cart-plus'}
                size={22}
                color={colors.neutral[0]}
              />
              <Text style={styles.addToCartText}>
                {addingToCart ? 'Added!' : 'Add to Cart'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* AR Viewer Modal */}
      {plant && (
        <ARViewerScreen
          visible={arVisible}
          plant={plant}
          size={selectedSize}
          onClose={() => setArVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  skeletonContent: {
    padding: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    gap: spacing.lg,
  },
  errorText: {
    ...typography.title3,
    color: colors.neutral[500],
  },

  // Image Gallery
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
    backgroundColor: colors.neutral[100],
  },
  imageCarousel: {
    width: '100%',
    height: 400,
  },
  imageSlide: {
    height: 400,
  },
  image: {
    width: '100%',
    height: 400,
  },
  imageError: {
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    marginTop: spacing.sm,
    color: colors.neutral[400],
    ...typography.footnote,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    backgroundColor: colors.neutral[0],
    width: 24,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    zIndex: 10,
  },
  navArrowLeft: {
    left: spacing.md,
  },
  navArrowRight: {
    right: spacing.md,
  },
  navArrowBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 100,
  },
  shareButton: {
    position: 'absolute',
    right: spacing.md + 52,
    zIndex: 100,
  },
  favoriteButton: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 100,
  },
  headerBtnBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
  },
  badgesContainer: {
    position: 'absolute',
    bottom: spacing.xl + 24,
    left: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[0],
  },

  // Content
  content: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: spacing.xl,
    paddingTop: spacing.xl + 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.title1,
    color: colors.neutral[900],
    flex: 1,
    marginRight: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  reviewCount: {
    ...typography.footnote,
    color: colors.neutral[500],
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryTag: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  categoryTagText: {
    ...typography.footnote,
    color: colors.primary[700],
    fontWeight: '600',
  },
  lightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent.gold}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  lightTagText: {
    ...typography.footnote,
    color: colors.neutral[700],
  },
  description: {
    ...typography.body,
    color: colors.neutral[600],
    lineHeight: 24,
    marginBottom: spacing.xl,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.neutral[900],
  },
  sectionHint: {
    ...typography.footnote,
    color: colors.neutral[500],
  },

  // Size Selector
  sizeSelectorContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sizeCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  sizeIconContainer: {
    marginBottom: spacing.sm,
  },
  sizeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeIconCircleSelected: {
    backgroundColor: colors.primary[100],
  },
  sizeName: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: 2,
  },
  sizeNameSelected: {
    color: colors.primary[700],
  },
  sizeHeight: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  sizePot: {
    ...typography.caption,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  sizePriceTag: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  sizePrice: {
    ...typography.footnote,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  sizePriceSelected: {
    color: colors.primary[700],
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Color Selector
  colorScrollContent: {
    paddingRight: spacing.xl,
    gap: spacing.md,
  },
  colorCard: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    minWidth: 100,
  },
  colorPreviewContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  colorPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorShadow: {
    position: 'absolute',
    bottom: -4,
    left: 6,
    right: 6,
    height: 10,
    borderRadius: 10,
    opacity: 0.3,
  },
  colorCheckmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorName: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 2,
  },
  colorNameSelected: {
    color: colors.primary[700],
  },
  materialTag: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  materialText: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  colorModifier: {
    ...typography.footnote,
    color: colors.primary[600],
    fontWeight: '600',
  },

  // Accessory Items
  accessoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral[0],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  accessoryCardSelected: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  accessoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessoryIconContainerSelected: {
    backgroundColor: colors.primary[100],
  },
  accessoryInfo: {
    flex: 1,
  },
  accessoryTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  accessoryTitleSelected: {
    color: colors.primary[700],
  },
  accessoryDesc: {
    ...typography.footnote,
    color: colors.neutral[500],
  },
  accessoryRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  accessoryPriceText: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  accessoryPriceTextSelected: {
    color: colors.primary[600],
  },
  accessoryCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessoryCheckSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },

  // Quantity Selector
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  quantityLabel: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  quantityBtnDisabled: {
    opacity: 0.5,
  },
  quantityValue: {
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    ...typography.title3,
    fontWeight: '700',
    color: colors.neutral[900],
  },

  // AR Button
  arButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  arButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  arButtonText: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  arBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  arBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[0],
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    ...typography.footnote,
    color: colors.neutral[500],
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary[700],
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  unitPrice: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
  },
  addToCartButton: {
    flex: 1.2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  addToCartButtonLoading: {
    opacity: 0.8,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 4,
    gap: spacing.sm,
  },
  addToCartText: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[0],
  },
});
