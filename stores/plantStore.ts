import { create } from 'zustand';
import { Plant, PlantCategory } from '../types';
import { plantService } from '../services/plantService';

interface PlantState {
  plants: Plant[];
  featuredPlants: Plant[];
  loading: boolean;
  loadPlants: () => Promise<void>;
  loadFeaturedPlants: () => Promise<void>;
  searchPlants: (term: string) => Promise<Plant[]>;
  getPlantsByCategory: (category: PlantCategory) => Promise<Plant[]>;
  getAllPlants: () => Promise<Plant[]>;
  getPlantById: (id: string) => Promise<Plant | null>;
}

export const usePlantStore = create<PlantState>((set) => ({
  plants: [],
  featuredPlants: [],
  loading: false,

  loadPlants: async () => {
    set({ loading: true });
    try {
      const plants = await plantService.getAllPlants();
      set({ plants, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  loadFeaturedPlants: async () => {
    set({ loading: true });
    try {
      const featuredPlants = await plantService.getFeaturedPlants();
      set({ featuredPlants, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  searchPlants: async (term) => {
    return await plantService.searchPlants(term);
  },

  getPlantsByCategory: async (category) => {
    return await plantService.getPlantsByCategory(category);
  },

  getAllPlants: async () => {
    return await plantService.getAllPlants();
  },

  getPlantById: async (id) => {
    return await plantService.getPlantById(id);
  },
}));


