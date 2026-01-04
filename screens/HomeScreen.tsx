import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PlantCardPremium } from '../components/PlantCardPremium';
import { SearchBar } from '../components/SearchBar';
import { SearchSuggestions } from '../components/SearchSuggestions';
import { CategoryChip } from '../components/CategoryChip';
import { PremiumHeader } from '../components/PremiumHeader';
import { usePlantStore } from '../stores/plantStore';
import { useAuthStore } from '../stores/authStore';
import { favoriteService } from '../services/favoriteService';
import { Plant, PlantCategory } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { colors, spacing } from '../theme';

const CATEGORIES: PlantCategory[] = [
  'Low Light',
  'Air Purifying',
  'Easy Care',
  'Succulents',
  'Flowering',
  'Large Plants',
  'Small Plants',
];

export const HomeScreen = () => {
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | null>(null);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchResults, setSearchResults] = useState<Plant[]>([]);
  const { featuredPlants, loadFeaturedPlants, searchPlants, getPlantsByCategory, loading } = usePlantStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const { getAllPlants } = usePlantStore();
  const [allPlants, setAllPlants] = useState<Plant[]>([]);

  useEffect(() => {
    loadFeaturedPlants();
    loadAllPlants();
  }, []);

  const loadAllPlants = async () => {
    const plants = await getAllPlants();
    setAllPlants(plants);
  };

  useEffect(() => {
    const filterPlants = async () => {
      if (selectedCategory) {
        const plants = await getPlantsByCategory(selectedCategory);
        setFilteredPlants(plants);
        setSearchResults([]);
      } else if (searchTerm) {
        const plants = await searchPlants(searchTerm);
        setFilteredPlants(plants);
        setSearchResults(plants);
      } else {
        // Show all plants when no filter/search is applied
        setFilteredPlants(allPlants.length > 0 ? allPlants : featuredPlants);
        setSearchResults([]);
      }
    };
    filterPlants();
  }, [searchTerm, selectedCategory, featuredPlants, allPlants]);

  const handlePlantPress = (plantId: string) => {
    setSearchTerm('');
    router.push(`/plant/${plantId}`);
  };

  const toggleFavorite = async (plantId: string) => {
    if (!user) return;
    const isFav = user.favorites?.includes(plantId) || false;
    try {
      await favoriteService.toggleFavorite(user.id, plantId, isFav);
      await useAuthStore.getState().loadUser();
    } catch (error) {
      // Silent fail
    }
  };

  const isFavorite = (plantId: string) => {
    return user?.favorites?.includes(plantId) || false;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[100] }]}>
      <PremiumHeader userName={user?.name} />

      <View style={[styles.searchContainer, { backgroundColor: colors.neutral[0] }]}>
        <SearchBar value={searchTerm} onChangeText={setSearchTerm} />
      </View>

      <SearchSuggestions
        plants={searchResults}
        onSelectPlant={handlePlantPress}
        visible={searchTerm.length > 0 && !selectedCategory}
      />

      <View style={[styles.categoriesContainer, { backgroundColor: colors.neutral[0] }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <CategoryChip
              label={item}
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
            />
          )}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <PlantCardPremium
              plant={item}
              onPress={() => handlePlantPress(item.id)}
              onFavorite={() => toggleFavorite(item.id)}
              isFavorite={isFavorite(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="leaf-off" size={64} color={colors.neutral[300]} />
              <Text style={[styles.emptyText, { color: colors.neutral[500] }]}>No plants found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  searchContainer: {
    backgroundColor: colors.neutral[0],
    paddingBottom: spacing.sm,
  },
  categoriesContainer: {
    backgroundColor: colors.neutral[0],
    paddingBottom: spacing.md,
  },
  categoriesList: {
    paddingHorizontal: spacing.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral[400],
    marginTop: spacing.lg,
  },
});
