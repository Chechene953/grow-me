import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { deviceService } from '../services/deviceService';
import { InstallationChoice } from '../types';
import { subscriptionPlans } from '../utils/subscriptionPlans';
import { subscriptionService } from '../services/subscriptionService';
import { useAuthStore } from '../stores/authStore';

interface DeviceSetupScreenProps {
  plantId: string;
}

export const DeviceSetupScreen = ({ plantId }: DeviceSetupScreenProps) => {
  const router = useRouter();
  const [choice, setChoice] = useState<InstallationChoice>('self');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const plan = useMemo(() => subscriptionPlans.assistedMonitoring, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (choice === 'assisted') {
        if (!user?.subscription?.active) {
          await subscriptionService.startAssistedMonitoring();
          Alert.alert('Subscription Activated', 'Your assisted monitoring subscription is active.');
        }
      }
      const device = await deviceService.connectDevice(plantId, choice);
      Alert.alert('Device Connected', `Device ${device.name} connected successfully.`);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', 'Could not connect the device.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Install Monitoring Device</Text>
      <Text style={styles.subtitle}>Choose an installation option</Text>

      <View style={[styles.option, choice === 'self' && styles.optionSelected]}>
        <Text style={styles.optionTitle}>Self-installation</Text>
        <Text style={styles.optionText}>Follow simple instructions to install yourself. Free.</Text>
        <Button title={choice === 'self' ? 'Selected' : 'Choose self-install'} onPress={() => setChoice('self')} variant={choice === 'self' ? 'primary' : 'outline'} />
      </View>

      <View style={[styles.option, choice === 'assisted' && styles.optionSelected]}>
        <Text style={styles.optionTitle}>Assisted installation</Text>
        <Text style={styles.optionText}>
          A technician helps you install. Includes 24/7 expert support and insurance.
        </Text>
        <View style={styles.planBox}>
          <Text style={styles.planTitle}>{plan.name}</Text>
          <Text style={styles.planPrice}>${plan.pricePerMonth.toFixed(2)}/month</Text>
          <Text style={styles.planDetail}>• 24/7 expert chat</Text>
          <Text style={styles.planDetail}>• IoT maintenance</Text>
          <Text style={styles.planDetail}>• Damage insurance</Text>
          <Text style={styles.planSmall}>
            You will be charged the first month now; renews monthly.
          </Text>
        </View>
        <Button title={choice === 'assisted' ? 'Selected' : 'Choose assisted (paid)'} onPress={() => setChoice('assisted')} variant={choice === 'assisted' ? 'primary' : 'outline'} />
      </View>

      <Button title={loading ? 'Connecting…' : 'Connect device'} onPress={handleConnect} style={styles.cta} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 16 },
  option: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#eee' },
  optionSelected: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  optionText: { fontSize: 14, color: '#555', marginBottom: 8 },
  planBox: { backgroundColor: '#F9FBF9', borderWidth: 1, borderColor: '#DCE9DE', padding: 12, borderRadius: 10, marginBottom: 10 },
  planTitle: { fontSize: 14, fontWeight: '700', color: '#2E7D32' },
  planPrice: { fontSize: 16, fontWeight: '700', color: '#333', marginVertical: 4 },
  planDetail: { fontSize: 13, color: '#444', marginBottom: 2 },
  planSmall: { fontSize: 12, color: '#777', marginTop: 6 },
  cta: { marginTop: 8 },
});


