import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform, FlatList, Dimensions, Animated } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { usePlantStore } from '../stores/plantStore';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { favoriteService } from '../services/favoriteService';
import { Plant, PlantSize, PotColor, Accessory, CartItem } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARViewerScreen } from './ARViewerScreen';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

type PlantDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlantDetail'>;
type PlantDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const AVAILABLE_ACCESSORIES: Accessory[] = [
  { id: '1', name: 'Decorative Stones', description: 'Add beautiful stones', price: 5.99 },
  { id: '2', name: 'Self-Watering System', description: 'Automated watering', price: 19.99 },
  { id: '3', name: 'Plant Food', description: 'Nutrient-rich fertilizer', price: 8.99 },
];

export const PlantDetailScreen = () => {
  const route = useRoute<PlantDetailScreenRouteProp>();
  const navigation = useNavigation<PlantDetailScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { plantId } = route.params;
  const { getPlantById } = usePlantStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<PlantSize>('Medium');
  const [selectedPotColor, setSelectedPotColor] = useState<PotColor | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<Accessory[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [arVisible, setArVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageCarouselRef = React.useRef<FlatList>(null);

  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  const currentImages = useMemo(() => {
    if (selectedPotColor?.images && selectedPotColor.images.length > 0) {
      return selectedPotColor.images;
    }
    return plant?.images || [];
  }, [selectedPotColor, plant]);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadPlant();
  }, [plantId]);

  useEffect(() => {
    calculatePrice();
  }, [plant, selectedSize, selectedPotColor, selectedAccessories]);

  useEffect(() => {
    setCurrentImageIndex(0);
    imageCarouselRef.current?.scrollToIndex({ index: 0, animated: false });
  }, [selectedPotColor?.name]);

  const loadPlant = async () => {
    const plantData = await getPlantById(plantId);
    if (plantData) {
      setPlant(plantData);
      setSelectedPotColor(plantData.colors[0] || null);
      setIsFavorite(user?.favorites?.includes(plantId) || false);
    }
  };

  useEffect(() => {
    if (user) {
      setIsFavorite(user.favorites?.includes(plantId) || false);
    }
  }, [user, plantId]);

  const calculatePrice = () => {
    if (!plant) return;

    let price = plant.basePrice;
    const sizeModifiers = { Small: 0.8, Medium: 1, Large: 1.5 };
    price *= sizeModifiers[selectedSize];

    if (selectedPotColor) {
      price += selectedPotColor.priceModifier;
    }

    selectedAccessories.forEach(acc => {
      price += acc.price;
    });

    setCurrentPrice(price);
  };

  const toggleAccessory = (accessory: Accessory) => {
    setSelectedAccessories(prev =>
      prev.find(a => a.id === accessory.id)
        ? prev.filter(a => a.id !== accessory.id)
        : [...prev, accessory]
    );
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to add favorites');
      return;
    }

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

    try {
      await favoriteService.toggleFavorite(user.id, plantId, isFavorite);
      setIsFavorite(!isFavorite);
      await useAuthStore.getState().loadUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleAddToCart = () => {
    if (!plant || !selectedPotColor) {
      Alert.alert('Error', 'Please select all required options');
      return;
    }

    const cartItem: CartItem = {
      plantId: plant.id,
      plant,
      size: selectedSize,
      potColor: selectedPotColor,
      accessories: selectedAccessories,
      quantity: 1,
      price: currentPrice,
    };

    addItem(cartItem);
    Alert.alert('Success', 'Added to cart!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  if (!plant) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
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

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <ImageSlide item={item} width={screenWidth} />
  );

  const careLevelColor = {
    Easy: colors.semantic.success,
    Medium: colors.semantic.warning,
    Hard: colors.semantic.error,
  }[plant.careLevel];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
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
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
            style={styles.imageCarousel}
          />

          {currentImages.length > 1 && (
            <View style={styles.imageIndicators}>
              {currentImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}

          {currentImages.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.navArrowLeft]}
                  onPress={() => {
                    const prevIndex = currentImageIndex - 1;
                    setCurrentImageIndex(prevIndex);
                    imageCarouselRef.current?.scrollToIndex({ index: prevIndex, animated: true });
                  }}
                >
                  <MaterialCommunityIcons name="chevron-left" size={28} color={colors.neutral[0]} />
                </TouchableOpacity>
              )}
              {currentImageIndex < currentImages.length - 1 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.navArrowRight]}
                  onPress={() => {
                    const nextIndex = currentImageIndex + 1;
                    setCurrentImageIndex(nextIndex);
                    imageCarouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                  }}
                >
                  <MaterialCommunityIcons name="chevron-right" size={28} color={colors.neutral[0]} />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + spacing.sm }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BlurView intensity={Platform.OS === 'ios' ? 60 : 80} tint="light" style={styles.backButtonBlur}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={colors.primary[700]} />
            </BlurView>
          </TouchableOpacity>

          {/* Favorite button */}
          <TouchableOpacity
            style={[styles.favoriteButton, { top: insets.top + spacing.sm }]}
            onPress={handleToggleFavorite}
          >
            <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
              <MaterialCommunityIcons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? colors.semantic.error : colors.neutral[0]}
              />
            </Animated.View>
          </TouchableOpacity>

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

        <View style={styles.content}>
          <Text style={styles.name}>{plant.name}</Text>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{plant.category}</Text>
            </View>
            <View style={styles.lightBadge}>
              <MaterialCommunityIcons name="white-balance-sunny" size={14} color={colors.accent.gold} />
              <Text style={styles.lightText}>{plant.lightPreference}</Text>
            </View>
          </View>
          <Text style={styles.description}>{plant.description}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Size</Text>
            <View style={styles.optionsContainer}>
              {plant.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => setSelectedSize(size)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={size === 'Small' ? 'pot-outline' : size === 'Medium' ? 'pot' : 'pot-mix-outline'}
                      size={20}
                      color={isSelected ? colors.primary[600] : colors.neutral[500]}
                    />
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Pot Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorOptionsContainer}>
                {plant.colors.map((color) => {
                  const isSelected = selectedPotColor?.name === color.name;
                  return (
                    <TouchableOpacity
                      key={color.name}
                      style={[styles.colorOption, isSelected && styles.colorOptionSelected]}
                      onPress={() => setSelectedPotColor(color)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.colorCircle, { backgroundColor: color.hexCode }]}>
                        {isSelected && (
                          <MaterialCommunityIcons name="check" size={16} color={colors.neutral[0]} />
                        )}
                      </View>
                      <Text style={[styles.colorText, isSelected && styles.colorTextSelected]}>
                        {color.name}
                      </Text>
                      <Text style={styles.colorMaterial}>{color.material}</Text>
                      {color.priceModifier > 0 && (
                        <Text style={styles.colorPrice}>+${color.priceModifier}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add-ons (Optional)</Text>
            {AVAILABLE_ACCESSORIES.map((accessory) => {
              const isSelected = selectedAccessories.some(a => a.id === accessory.id);
              return (
                <TouchableOpacity
                  key={accessory.id}
                  style={[styles.accessoryItem, isSelected && styles.accessoryItemSelected]}
                  onPress={() => toggleAccessory(accessory)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.accessoryCheckbox, isSelected && styles.accessoryCheckboxSelected]}>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={14} color={colors.neutral[0]} />
                    )}
                  </View>
                  <View style={styles.accessoryContent}>
                    <Text style={styles.accessoryName}>{accessory.name}</Text>
                    <Text style={styles.accessoryDescription}>{accessory.description}</Text>
                  </View>
                  <Text style={styles.accessoryPrice}>+${accessory.price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="View in your space (AR)"
            onPress={() => {
              if (!plant) {
                Alert.alert('Error', 'Plant information not available');
                return;
              }
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
            variant="outline"
            icon="augmented-reality"
            fullWidth
          />
        </View>
      </ScrollView>

      <BlurView
        intensity={90}
        tint="light"
        style={[styles.footer, { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.md) }]}
      >
        <View style={styles.footerContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.price}>
              <Text style={styles.currencySymbol}>$</Text>
              {currentPrice.toFixed(2)}
            </Text>
          </View>
          <Button
            title="Add to Cart"
            onPress={handleAddToCart}
            icon="cart-plus"
            size="large"
            style={styles.addButton}
          />
        </View>
      </BlurView>

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
    backgroundColor: colors.neutral[0],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 360,
    backgroundColor: colors.neutral[100],
  },
  imageCarousel: {
    width: '100%',
    height: 360,
  },
  imageSlide: {
    height: 360,
  },
  image: {
    width: '100%',
    height: 360,
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
    bottom: spacing.lg,
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: colors.neutral[0],
    width: 24,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navArrowLeft: {
    left: spacing.md,
  },
  navArrowRight: {
    right: spacing.md,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 100,
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
  },
  favoriteButton: {
    position: 'absolute',
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  badgesContainer: {
    position: 'absolute',
    bottom: spacing.lg + 24,
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
  content: {
    padding: spacing.xl,
  },
  name: {
    ...typography.title1,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  categoryText: {
    ...typography.footnote,
    color: colors.primary[700],
    fontWeight: '600',
  },
  lightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent.gold}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  lightText: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  description: {
    ...typography.body,
    color: colors.neutral[600],
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    gap: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  optionText: {
    ...typography.callout,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  optionTextSelected: {
    color: colors.primary[700],
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.xl,
  },
  colorOption: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    minWidth: 100,
  },
  colorOptionSelected: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  colorTextSelected: {
    color: colors.primary[700],
  },
  colorMaterial: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  colorPrice: {
    ...typography.caption,
    color: colors.primary[600],
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  accessoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  accessoryItemSelected: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  accessoryCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessoryCheckboxSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  accessoryContent: {
    flex: 1,
  },
  accessoryName: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  accessoryDescription: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  accessoryPrice: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.primary[600],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    ...shadows.lg,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    marginBottom: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary[700],
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
  },
  loadingText: {
    ...typography.body,
    color: colors.neutral[500],
  },
});
