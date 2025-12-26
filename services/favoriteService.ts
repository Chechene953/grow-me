import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

export const favoriteService = {
  // Add plant to favorites
  async addFavorite(userId: string, plantId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayUnion(plantId),
    });
  },

  // Remove plant from favorites
  async removeFavorite(userId: string, plantId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      favorites: arrayRemove(plantId),
    });
  },

  // Toggle favorite status
  async toggleFavorite(userId: string, plantId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await this.removeFavorite(userId, plantId);
    } else {
      await this.addFavorite(userId, plantId);
    }
  },
};








