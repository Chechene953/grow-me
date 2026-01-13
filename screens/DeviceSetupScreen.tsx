import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { deviceService } from '../services/deviceService';
import { InstallationChoice } from '../types';
import { subscriptionPlans } from '../utils/subscriptionPlans';
import { subscriptionService } from '../services/subscriptionService';
import { useAuthStore } from '../stores/authStore';
import { colors as defaultColors, spacing, borderRadius } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface DeviceSetupScreenProps {
  plantId: string;
}

export const DeviceSetupScreen = ({ plantId }: DeviceSetupScreenProps) => {
  const router = useRouter();
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <Text style={[styles.title, { color: colors.neutral[900] }]}>Install Monitoring Device</Text>
      <Text style={[styles.subtitle, { color: colors.neutral[500] }]}>Choose an installation option</Text>

      <View style={[styles.option, { backgroundColor: colors.neutral[0], borderColor: colors.neutral[200] }, choice === 'self' && { borderColor: colors.primary[600], backgroundColor: colors.primary[50] }]}>
        <Text style={[styles.optionTitle, { color: colors.neutral[900] }]}>Self-installation</Text>
        <Text style={[styles.optionText, { color: colors.neutral[600] }]}>Follow simple instructions to install yourself. Free.</Text>
        <Button title={choice === 'self' ? 'Selected' : 'Choose self-install'} onPress={() => setChoice('self')} variant={choice === 'self' ? 'primary' : 'outline'} />
      </View>

      <View style={[styles.option, { backgroundColor: colors.neutral[0], borderColor: colors.neutral[200] }, choice === 'assisted' && { borderColor: colors.primary[600], backgroundColor: colors.primary[50] }]}>
        <Text style={[styles.optionTitle, { color: colors.neutral[900] }]}>Assisted installation</Text>
        <Text style={[styles.optionText, { color: colors.neutral[600] }]}>
          A technician helps you install. Includes 24/7 expert support and insurance.
        </Text>
        <View style={[styles.planBox, { backgroundColor: colors.neutral[100], borderColor: colors.neutral[200] }]}>
          <Text style={[styles.planTitle, { color: colors.primary[600] }]}>{plan.name}</Text>
          <Text style={[styles.planPrice, { color: colors.neutral[900] }]}>${plan.pricePerMonth.toFixed(2)}/month</Text>
          <Text style={[styles.planDetail, { color: colors.neutral[700] }]}>• 24/7 expert chat</Text>
          <Text style={[styles.planDetail, { color: colors.neutral[700] }]}>• IoT maintenance</Text>
          <Text style={[styles.planDetail, { color: colors.neutral[700] }]}>• Damage insurance</Text>
          <Text style={[styles.planSmall, { color: colors.neutral[500] }]}>
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
  container: { flex: 1, backgroundColor: defaultColors.neutral[50], padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: defaultColors.neutral[900], marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: defaultColors.neutral[500], marginBottom: spacing.lg },
  option: { backgroundColor: defaultColors.neutral[0], borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 2, borderColor: defaultColors.neutral[200] },
  optionSelected: { borderColor: defaultColors.primary[600], backgroundColor: defaultColors.primary[50] },
  optionTitle: { fontSize: 16, fontWeight: '700', color: defaultColors.neutral[900], marginBottom: spacing.xs },
  optionText: { fontSize: 14, color: defaultColors.neutral[600], marginBottom: spacing.sm },
  planBox: { backgroundColor: defaultColors.neutral[100], borderWidth: 1, borderColor: defaultColors.neutral[200], padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  planTitle: { fontSize: 14, fontWeight: '700', color: defaultColors.primary[600] },
  planPrice: { fontSize: 16, fontWeight: '700', color: defaultColors.neutral[900], marginVertical: spacing.xs },
  planDetail: { fontSize: 13, color: defaultColors.neutral[700], marginBottom: 2 },
  planSmall: { fontSize: 12, color: defaultColors.neutral[500], marginTop: spacing.xs },
  cta: { marginTop: spacing.sm },
});


