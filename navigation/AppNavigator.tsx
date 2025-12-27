import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { onAuthStateChanged } from 'firebase/auth';
import { initAuth } from '../services/firebase';
import { GlassTabBar } from '../components/GlassTabBar';
import { ModernHeader } from '../components/ModernHeader';
import { colors } from '../theme';

import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PlantDetailScreen } from '../screens/PlantDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/OrderConfirmationScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CareTipsScreen } from '../screens/CareTipsScreen';
import { PlantCareScreen } from '../screens/PlantCareScreen';
import { DeviceSetupScreen } from '../screens/DeviceSetupScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { SubscriptionManageScreen } from '../screens/SubscriptionManageScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  PlantDetail: { plantId: string };
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  Orders: undefined;
  Favorites: undefined;
  CareTips: undefined;
  EditProfile: undefined;
  PlantCare: { plantId: string };
  DeviceSetup: { plantId: string };
  SubscriptionManage: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

// Modern iOS-style screen transitions
const screenOptions = {
  headerShown: false,
  gestureEnabled: true,
  cardOverlayEnabled: true,
  ...Platform.select({
    ios: TransitionPresets.SlideFromRightIOS,
    android: TransitionPresets.SlideFromRightIOS,
  }),
  cardStyle: {
    backgroundColor: colors.neutral[100],
  },
};

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={screenOptions}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => {
  const { items } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading, loadUser } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

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

  if (!authReady || loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="CareTips" component={CareTipsScreen} />
            <Stack.Screen name="PlantCare" component={PlantCareScreen} />
            <Stack.Screen name="DeviceSetup" component={DeviceSetupScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="SubscriptionManage" component={SubscriptionManageScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
