import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Plant } from '../types';

interface SearchSuggestionsProps {
  plants: Plant[];
  onSelectPlant: (plantId: string) => void;
  visible: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  plants,
  onSelectPlant,
  visible,
}) => {
  if (!visible || plants.length === 0) {
    return null;
  }

  const getPlantPreviewImage = (plant: Plant): string => {
    // Try to get the first image from the first color variant with images
    if (plant.colors && plant.colors.length > 0) {
      const firstColor = plant.colors[0];
      if (firstColor.images && firstColor.images.length > 0) {
        return firstColor.images[0];
      }
    }
    // Fallback to default plant images
    if (plant.images && plant.images.length > 0) {
      return plant.images[0];
    }
    // Final fallback
    return 'https://via.placeholder.com/60';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={plants.slice(0, 5)} // Limit to 5 suggestions
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => onSelectPlant(item.id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: getPlantPreviewImage(item) }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.textContainer}>
              <Text style={styles.plantName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.plantCategory} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: -8,
    marginBottom: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  plantCategory: {
    fontSize: 14,
    color: '#666',
  },
});




