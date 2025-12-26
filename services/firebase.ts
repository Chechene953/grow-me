import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCvz8nVsHT7ffEY6-aGqgxcMPHGiNrvvPE',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'growme-9e45f.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'growme-9e45f',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '317576532523',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:317576532523:web:37d556eba2a469f1ad106e',
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let _auth: Auth | null = null;
let _authInitPromise: Promise<Auth> | null = null;

export async function initAuth(): Promise<Auth> {
  if (_auth) {
    return _auth;
  }

  if (_authInitPromise) {
    return _authInitPromise;
  }

  _authInitPromise = (async () => {
    try {
      const firebaseAuthModule = require('firebase/auth');
      const getReactNativePersistence = firebaseAuthModule.getReactNativePersistence;
      const initializeAuth = firebaseAuthModule.initializeAuth;

      if (initializeAuth && getReactNativePersistence && AsyncStorage) {
        try {
          const authInstance = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
          _auth = authInstance;
          return authInstance;
        } catch (error: any) {
          if (error.code === 'auth/already-initialized') {
            _auth = getAuth(app);
            return _auth;
          }
          if (error.message?.includes('not been registered yet')) {
            await new Promise(resolve => setTimeout(resolve, 500));
            try {
              const authInstance = initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage),
              });
              _auth = authInstance;
              return authInstance;
            } catch (retryError: any) {
              // Fall through to getAuth
            }
          }
        }
      }

      _auth = getAuth(app);
      return _auth;
    } catch (error: any) {
      try {
        _auth = getAuth(app);
        return _auth;
      } catch (fallbackError: any) {
        throw fallbackError;
      }
    }
  })();

  return _authInitPromise;
}

export function getAuthInstance(): Auth {
  if (!_auth) {
    throw new Error('Auth not initialized. Call initAuth() first.');
  }
  return _auth;
}

export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    if (!_auth) {
      try {
        _auth = getAuth(app);
      } catch (e) {
        throw new Error('Auth not initialized. Please call initAuth() first.');
      }
    }
    const value = (_auth as any)[prop];
    if (typeof value === 'function') {
      return value.bind(_auth);
    }
    return value;
  },
}) as Auth;

export const db = getFirestore(app);

export default app;
