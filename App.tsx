import React from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ENV } from './utils/env';

export default function App() {
  return (
    <StripeProvider publishableKey={ENV.STRIPE_PUBLISHABLE_KEY}>
      <StatusBar style="auto" />
      <AppNavigator />
    </StripeProvider>
  );
}

