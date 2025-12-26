import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PlantCard } from '../components/PlantCard';
import { SearchBar } from '../components/SearchBar';
import { SearchSuggestions } from '../components/SearchSuggestions';
import { CategoryChip } from '../components/CategoryChip';
import { Logo } from '../components/Logo';
import { usePlantStore } from '../stores/plantStore';
import { useAuthStore } from '../stores/authStore';
import { favoriteService } from '../services/favoriteService';
import { Plant, PlantCategory } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | null>(null);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchResults, setSearchResults] = useState<Plant[]>([]);
  const { featuredPlants, loadFeaturedPlants, searchPlants, getPlantsByCategory, loading } = usePlantStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    loadFeaturedPlants();
  }, []);

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
        setFilteredPlants(featuredPlants);
        setSearchResults([]);
      }
    };
    filterPlants();
  }, [searchTerm, selectedCategory, featuredPlants]);

  const handlePlantPress = (plantId: string) => {
    setSearchTerm(''); // Clear search when navigating
    (navigation as any).navigate('PlantDetail', { plantId });
  };

  const toggleFavorite = async (plantId: string) => {
    if (!user) return;
    const isFavorite = user.favorites?.includes(plantId) || false;
    try {
      await favoriteService.toggleFavorite(user.id, plantId, isFavorite);
      // Reload user to update favorites
      await useAuthStore.getState().loadUser();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const isFavorite = (plantId: string) => {
    return user?.favorites?.includes(plantId) || false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="medium" />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.greeting}>Hello {user?.name || 'User'} 👋</Text>
          <Text style={styles.subtitle}>Find your perfect plant</Text>
        </View>
      </View>

      <SearchBar value={searchTerm} onChangeText={setSearchTerm} />

      <SearchSuggestions
        plants={searchResults}
        onSelectPlant={handlePlantPress}
        visible={searchTerm.length > 0 && !selectedCategory}
      />

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
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
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlantCard
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
              <MaterialCommunityIcons name="leaf-off" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No plants found</Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerLeft: {
    marginRight: 16,
  },
  headerRight: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingLeft: 24,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 24,
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
    color: '#999',
    marginTop: 16,
  },
});

