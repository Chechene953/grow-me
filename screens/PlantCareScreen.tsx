import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePlantStore } from '../stores/plantStore';
import { Plant } from '../types';

type PlantCareRoute = RouteProp<RootStackParamList, 'PlantCare'>;

export const PlantCareScreen = () => {
  const route = useRoute<PlantCareRoute>();
  const { plantId } = route.params;
  const { getPlantById } = usePlantStore();
  const [plant, setPlant] = useState<Plant | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getPlantById(plantId);
      setPlant(p || null);
    })();
  }, [plantId]);

  if (!plant) {
    return (
      <View style={styles.loading}><Text>Loading...</Text></View>
    );
  }

  const general: { title: string; tips: string[] }[] = [
    {
      title: 'Watering',
      tips: [
        'Water when the top 2-3 cm of soil are dry',
        'Reduce frequency in winter',
      ],
    },
    {
      title: 'Light',
      tips: [
        plant.lightPreference === 'Low' ? 'Prefers low to medium indirect light' :
        plant.lightPreference === 'Medium' ? 'Bright, indirect light is ideal' :
        'Very bright light; avoid direct, harsh midday sun',
      ],
    },
    {
      title: 'Fertilizer',
      tips: [ 'Feed monthly in spring and summer with balanced fertilizer' ],
    },
    {
      title: 'Humidity',
      tips: [ 'Keep indoor humidity moderate; avoid very dry air' ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{plant.name} Care & Tips</Text>
      <Text style={styles.subtitle}>Care level: {plant.careLevel}</Text>

      {general.map((section, idx) => (
        <View style={styles.card} key={idx}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          {section.tips.map((t, i) => (
            <Text key={i} style={styles.tip}>• {t}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 24 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#333' },
  tip: { fontSize: 14, color: '#555', marginBottom: 6, lineHeight: 20 },
});


