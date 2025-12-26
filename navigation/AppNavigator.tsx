import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { onAuthStateChanged } from 'firebase/auth';
import { initAuth } from '../services/firebase';
import { Badge } from '../components/Badge';

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

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => {
  const { items } = useCartStore();
  const { user } = useAuthStore();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = user?.favorites?.length || 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialCommunityIcons name="cart" size={size} color={color} />
              <Badge count={cartItemCount} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialCommunityIcons name="account" size={size} color={color} />
              {favoritesCount > 0 && <Badge count={favoritesCount} />}
            </View>
          ),
        }}
      />
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="PlantDetail"
              component={PlantDetailScreen}
              options={{ headerShown: true, title: 'Plant Details' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ headerShown: true, title: 'Checkout' }}
            />
            <Stack.Screen
              name="OrderConfirmation"
              component={OrderConfirmationScreen}
              options={{ headerShown: true, title: 'Order Confirmed' }}
            />
            <Stack.Screen
              name="Orders"
              component={OrdersScreen}
              options={{ headerShown: true, title: 'My Orders' }}
            />
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ headerShown: true, title: 'Favorites' }}
            />
            <Stack.Screen
              name="CareTips"
              component={CareTipsScreen}
              options={{ headerShown: true, title: 'Care Tips' }}
            />
            <Stack.Screen
              name="PlantCare"
              component={PlantCareScreen}
              options={{ headerShown: true, title: 'Plant Care' }}
            />
            <Stack.Screen
              name="DeviceSetup"
              component={DeviceSetupScreen}
              options={{ headerShown: true, title: 'Device Setup' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: true, title: 'Edit Profile' }}
            />
            <Stack.Screen
              name="SubscriptionManage"
              component={SubscriptionManageScreen}
              options={{ headerShown: true, title: 'Subscription' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
