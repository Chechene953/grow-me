import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CARE_TIPS = [
  {
    category: 'Watering',
    icon: 'water',
    tips: [
      'Water when the top inch of soil is dry',
      'Use room temperature water',
      'Avoid overwatering - it can cause root rot',
      'Different plants have different water needs',
    ],
  },
  {
    category: 'Light',
    icon: 'lightbulb',
    tips: [
      'Most indoor plants prefer bright, indirect light',
      'Low light plants can survive in darker areas',
      'Rotate plants regularly for even growth',
      'Avoid direct sunlight for most houseplants',
    ],
  },
  {
    category: 'Fertilizer',
    icon: 'leaf',
    tips: [
      'Fertilize during growing season (spring/summer)',
      'Use a balanced, water-soluble fertilizer',
      'Dilute fertilizer to half strength',
      'Avoid fertilizing in winter',
    ],
  },
  {
    category: 'Pruning',
    icon: 'scissors-cutting',
    tips: [
      'Remove dead or yellowing leaves',
      'Prune to encourage bushier growth',
      'Use clean, sharp scissors',
      'Prune in spring for best results',
    ],
  },
  {
    category: 'Repotting',
    icon: 'flower',
    tips: [
      'Repot when roots fill the container',
      'Choose a pot 1-2 inches larger',
      'Use well-draining soil',
      'Repot in spring or early summer',
    ],
  },
];

export const CareTipsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Care Tips</Text>
        <Text style={styles.subtitle}>Essential tips for keeping your plants healthy</Text>
      </View>

      {CARE_TIPS.map((section, index) => (
        <View key={index} style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name={section.icon as any} size={24} color="#2E7D32" />
            <Text style={styles.sectionTitle}>{section.category}</Text>
          </View>
          {section.tips.map((tip, tipIndex) => (
            <View key={tipIndex} style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginTop: 6,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});


