import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Button } from '../components/Button';
import { useAuthStore } from '../stores/authStore';
import { stripeService } from '../services/stripeService';
import * as WebBrowser from 'expo-web-browser';

export const SubscriptionManageScreen = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const openBillingPortal = async () => {
    try {
      setLoading(true);
      // In your backend, use the stored Stripe customer id related to this user
      const customerId = user?.stripeCustomerId; // optional if you store it
      const { url } = await stripeService.getBillingPortalUrl({ customerId });
      await WebBrowser.openBrowserAsync(url);
    } catch (e: any) {
      Alert.alert('Error', 'Unable to open billing portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Subscription</Text>
      {user?.subscription?.active ? (
        <>
          <Text style={styles.status}>Plan: Assisted Monitoring</Text>
          <Text style={styles.status}>Price: ${user.subscription.pricePerMonth}/month</Text>
          <Text style={styles.status}>Support: {user.subscription.supportLevel}</Text>
          {user.subscription.includesInsurance && (
            <Text style={styles.status}>Includes damage insurance</Text>
          )}
          <Button title={loading ? 'Opening…' : 'Open Billing Portal'} onPress={openBillingPortal} style={{ marginTop: 16 }} />
        </>
      ) : (
        <Text style={styles.status}>You do not have an active subscription.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 12 },
  status: { fontSize: 14, color: '#555', marginTop: 6 },
});


