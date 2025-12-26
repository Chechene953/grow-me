import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform, FlatList, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { usePlantStore } from '../stores/plantStore';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { favoriteService } from '../services/favoriteService';
import { Plant, PlantSize, PotColor, Accessory, CartItem } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ARViewerScreen } from './ARViewerScreen';

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
  const { plantId } = route.params;
  const { getPlantById } = usePlantStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  
  const goToCare = () => {
    (navigation as any).navigate('PlantCare', { plantId });
  };

  const goToDeviceSetup = () => {
    (navigation as any).navigate('DeviceSetup', { plantId });
  };

  const [plant, setPlant] = useState<Plant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<PlantSize>('Medium');
  const [selectedPotColor, setSelectedPotColor] = useState<PotColor | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<Accessory[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [arVisible, setArVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageCarouselRef = React.useRef<FlatList>(null);

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

  // Reset image index and scroll to start when pot color changes
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

    // Size modifier
    const sizeModifiers = { Small: 0.8, Medium: 1, Large: 1.5 };
    price *= sizeModifiers[selectedSize];

    // Pot color modifier
    if (selectedPotColor) {
      price += selectedPotColor.priceModifier;
    }

    // Accessories
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
        <Text>Loading...</Text>
      </View>
    );
  }

  const ImageSlide = ({ item, width }: { item: string; width: number }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <View style={[styles.imageSlide, { width }]}>
        {imageError ? (
          <View style={[styles.image, styles.imageError]}>
            <MaterialCommunityIcons name="image-off" size={48} color="#ccc" />
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

  return (
    <ScrollView style={styles.container}>
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
                <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
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
                <MaterialCommunityIcons name="chevron-right" size={32} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? '#f44336' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.category}>{plant.category}</Text>
        <Text style={styles.description}>{plant.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.optionsContainer}>
            {plant.sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.option,
                  selectedSize === size && styles.optionSelected,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedSize === size && styles.optionTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pot Color & Material</Text>
          <View style={styles.optionsContainer}>
            {plant.colors.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.colorOption,
                  selectedPotColor?.name === color.name && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedPotColor(color)}
              >
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color.hexCode },
                  ]}
                />
                <Text style={styles.colorText}>{color.name}</Text>
                <Text style={styles.colorMaterial}>{color.material}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessories (Optional)</Text>
          {AVAILABLE_ACCESSORIES.map((accessory) => {
            const isSelected = selectedAccessories.some(a => a.id === accessory.id);
            return (
              <TouchableOpacity
                key={accessory.id}
                style={[
                  styles.accessoryItem,
                  isSelected && styles.accessoryItemSelected,
                ]}
                onPress={() => toggleAccessory(accessory)}
              >
                <View style={styles.accessoryContent}>
                  <Text style={styles.accessoryName}>{accessory.name}</Text>
                  <Text style={styles.accessoryDescription}>{accessory.description}</Text>
                </View>
                <View style={styles.accessoryRight}>
                  <Text style={styles.accessoryPrice}>+${accessory.price}</Text>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>${currentPrice.toFixed(2)}</Text>
        </View>

        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          icon="cart-plus"
          style={styles.addButton}
        />

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
          style={{ marginTop: 10 }}
          icon="augmented-reality"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care & Monitoring</Text>
          <View style={{ gap: 8 }}>
            <Button title="View care tips for this plant" onPress={goToCare} variant="outline" />
            <Button title="Add monitoring device" onPress={goToDeviceSetup} variant="secondary" />
          </View>
        </View>
      </View>

      {plant && (
        <ARViewerScreen
          visible={arVisible}
          plant={plant}
          size={selectedSize}
          onClose={() => setArVisible(false)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  imageCarousel: {
    width: '100%',
    height: 300,
  },
  imageSlide: {
    height: 300,
  },
  image: {
    width: '100%',
    height: 300,
  },
  imageError: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  navArrow: {
    position: 'absolute',
    top: 130,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    padding: 8,
    zIndex: 10,
  },
  navArrowLeft: {
    left: 16,
  },
  navArrowRight: {
    right: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 24,
    padding: 12,
  },
  content: {
    padding: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  colorOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 12,
    minWidth: 100,
  },
  colorOptionSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  colorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  colorMaterial: {
    fontSize: 12,
    color: '#666',
  },
  accessoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  accessoryItemSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  accessoryContent: {
    flex: 1,
  },
  accessoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  accessoryDescription: {
    fontSize: 14,
    color: '#666',
  },
  accessoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accessoryPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
  },
  addButton: {
    marginBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

