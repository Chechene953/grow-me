import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Plant } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme';

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
  const { colors } = useTheme();

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
    return plant.images[0];
  };

  return (
    <View style={[styles.container, {
      backgroundColor: colors.neutral[0],
      borderColor: colors.neutral[200],
      shadowColor: colors.neutral[900],
    }]}>
      <FlatList
        data={plants.slice(0, 5)} // Limit to 5 suggestions
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.suggestionItem, { borderBottomColor: colors.neutral[100] }]}
            onPress={() => onSelectPlant(item.id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: getPlantPreviewImage(item) }}
              style={[styles.previewImage, { backgroundColor: colors.neutral[100] }]}
              resizeMode="cover"
            />
            <View style={styles.textContainer}>
              <Text style={[styles.plantName, { color: colors.neutral[900] }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.plantCategory, { color: colors.neutral[500] }]} numberOfLines={1}>
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
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    ...shadows.md,
    borderWidth: 1,
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  plantCategory: {
    fontSize: 14,
  },
});
