import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PlantCard } from '../components/PlantCard';
import { useAuthStore } from '../stores/authStore';
import { usePlantStore } from '../stores/plantStore';
import { favoriteService } from '../services/favoriteService';
import { Plant } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const FavoritesScreen = () => {
  const { user } = useAuthStore();
  const { getAllPlants } = usePlantStore();
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const [favoritePlants, setFavoritePlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

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
      const favorites = allPlants.filter((plant: Plant) => user.favorites.includes(plant.id));
      setFavoritePlants(favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlantPress = (plantId: string) => {
    (navigation as any).navigate('PlantDetail', { plantId });
  };

  const toggleFavorite = async (plantId: string) => {
    if (!user) return;
    try {
      await favoriteService.toggleFavorite(user.id, plantId, true);
      await useAuthStore.getState().loadUser();
      loadFavorites();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (favoritePlants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="heart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No favorites yet</Text>
        <Text style={styles.emptySubtext}>Start adding plants to your favorites</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoritePlants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlantCard
            plant={item}
            onPress={() => handlePlantPress(item.id)}
            onFavorite={() => toggleFavorite(item.id)}
            isFavorite={true}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

