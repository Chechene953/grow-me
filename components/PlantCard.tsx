import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Plant } from '../types';

interface PlantCardProps {
  plant: Plant;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onPress,
  onFavorite,
  isFavorite = false,
}) => {
  // Get image from first color variant if available, otherwise use plant default image
  const getImageUrl = () => {
    if (plant.colors && plant.colors.length > 0) {
      const firstColor = plant.colors[0];
      if (firstColor.images && firstColor.images.length > 0) {
        return firstColor.images[0];
      }
    }
    return plant.images[0] || 'https://via.placeholder.com/200';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl() }}
          style={styles.image}
          resizeMode="cover"
        />
        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#f44336' : '#666'}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {plant.name}
        </Text>
        <Text style={styles.category}>{plant.category}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${plant.basePrice}</Text>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="lightbulb-outline" size={14} color="#666" />
            <Text style={styles.badgeText}>{plant.lightPreference}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});





