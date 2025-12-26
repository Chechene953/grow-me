import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string, profile?: { name?: string; email?: string }) => Promise<void>;
  signInWithApple: (idToken: string, nonce: string, profile?: { name?: string; email?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  
  signUp: async (email, password, name) => {
    set({ loading: true });
    try {
      const user = await authService.signUp(email, password, name);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const user = await authService.signIn(email, password);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signInWithGoogle: async (idToken, profile) => {
    set({ loading: true });
    try {
      const user = await authService.signInWithGoogleIdToken(idToken, profile);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signInWithApple: async (idToken, nonce, profile) => {
    set({ loading: true });
    try {
      const user = await authService.signInWithApple(idToken, nonce, profile);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await authService.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  resetPassword: async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    try {
      await authService.updateProfile(user.id, updates);
      set({ user: { ...user, ...updates } });
    } catch (error) {
      throw error;
    }
  },

  loadUser: async () => {
    set({ loading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
}));



