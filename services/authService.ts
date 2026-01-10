import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';
import { OAuthProvider } from 'firebase/auth';

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData: User = {
      id: user.uid,
      name,
      email: user.email || email,
      favorites: [],
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: new Date(),
    });

    return userData;
  },

  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        id: userDoc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
      } as User;
    }

    const userData: User = {
      id: user.uid,
      name: user.displayName || 'User',
      email: user.email || email,
      favorites: [],
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: new Date(),
    });
    return userData;
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          id: userDoc.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
        } as User;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    // Remove undefined values as Firestore doesn't accept them
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    // Also clean nested objects like address
    if (cleanUpdates.address && typeof cleanUpdates.address === 'object') {
      cleanUpdates.address = Object.fromEntries(
        Object.entries(cleanUpdates.address).filter(([_, value]) => value !== undefined && value !== '')
      );
    }

    await updateDoc(doc(db, 'users', userId), cleanUpdates);
  },

  async signInWithGoogleIdToken(idToken: string, profile?: { name?: string; email?: string }): Promise<User> {
    if (!idToken) {
      throw new Error('No ID token provided');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const { user } = await signInWithCredential(auth, credential);

    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        id: userDoc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
      } as User;
    }

    const userData: User = {
      id: user.uid,
      name: user.displayName || profile?.name || 'User',
      email: user.email || profile?.email || '',
      favorites: [],
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), { ...userData, createdAt: new Date() });
    return userData;
  },

  async signInWithApple(idToken: string, nonce: string, profile?: { name?: string; email?: string }): Promise<User> {
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({ idToken, rawNonce: nonce });
    const { user } = await signInWithCredential(auth, credential);

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        id: userDoc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
      } as User;
    }

    const userData: User = {
      id: user.uid,
      name: user.displayName || profile?.name || 'User',
      email: user.email || profile?.email || '',
      favorites: [],
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', user.uid), { ...userData, createdAt: new Date() });
    return userData;
  },
};
