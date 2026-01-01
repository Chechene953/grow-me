import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/authStore';
import { onAuthStateChanged } from 'firebase/auth';
import { initAuth } from '../services/firebase';
import { colors } from '../theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, loading, loadUser } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    // Add any custom fonts here
  });

  // Initialize auth
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupAuth = async () => {
      try {
        const auth = await initAuth();
        await loadUser();

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            await loadUser();
          } else {
            useAuthStore.setState({ user: null, loading: false });
          }
        });

        setAuthReady(true);
      } catch (error) {
        console.error('Auth setup error:', error);
        setAuthReady(true);
      }
    };

    setupAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (!authReady || loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, authReady, loading]);

  // Hide splash screen when ready
  useEffect(() => {
    if (authReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [authReady, fontsLoaded]);

  // Show loading while initializing
  if (!authReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary[600] }}>
        <ActivityIndicator size="large" color={colors.neutral[0]} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: colors.neutral[100],
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="plant/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="order-confirmation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="care-tips" options={{ headerShown: false }} />
        <Stack.Screen name="plant-care/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="device-setup/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="subscription-manage" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
