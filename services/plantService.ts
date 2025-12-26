import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Plant, PlantCategory } from '../types';

export const plantService = {
  // Get all plants
  async getAllPlants(): Promise<Plant[]> {
    const plantsRef = collection(db, 'plants');
    const snapshot = await getDocs(plantsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plant));
  },

  // Get featured plants
  async getFeaturedPlants(): Promise<Plant[]> {
    const plantsRef = collection(db, 'plants');
    const q = query(plantsRef, where('featured', '==', true), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plant));
  },

  // Get plant by ID
  async getPlantById(id: string): Promise<Plant | null> {
    const plantDoc = await getDoc(doc(db, 'plants', id));
    if (plantDoc.exists()) {
      return { id: plantDoc.id, ...plantDoc.data() } as Plant;
    }
    return null;
  },

  // Get plants by category
  async getPlantsByCategory(category: PlantCategory): Promise<Plant[]> {
    const plantsRef = collection(db, 'plants');
    const q = query(plantsRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plant));
  },

  // Search plants
  async searchPlants(searchTerm: string): Promise<Plant[]> {
    const allPlants = await this.getAllPlants();
    const term = searchTerm.toLowerCase();
    return allPlants.filter(plant => 
      plant.name.toLowerCase().includes(term) ||
      plant.description.toLowerCase().includes(term) ||
      plant.category.toLowerCase().includes(term)
    );
  },
};








