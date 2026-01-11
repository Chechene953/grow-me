import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { usePlantStore } from '../stores/plantStore';
import { Plant } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface CareSection {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  tips: string[];
}

const getCareGuide = (plant: Plant): CareSection[] => {
  const lightTip = {
    Low: 'Prefers low to medium indirect light. Can tolerate darker corners.',
    Medium: 'Thrives in bright, indirect light. Avoid direct sunlight.',
    Bright: 'Needs plenty of bright light. Some direct morning sun is fine.',
    Direct: 'Can handle direct sunlight. Place near a sunny window.',
  }[plant.lightPreference];

  const careDifficulty = {
    Easy: 'This plant is very forgiving and perfect for beginners.',
    Medium: 'Requires moderate attention but adapts well.',
    Hard: 'Needs consistent care and specific conditions to thrive.',
  }[plant.careLevel];

  return [
    {
      title: 'Watering',
      icon: 'water',
      color: '#4FC3F7',
      tips: [
        'Check soil moisture before watering - the top 2-3cm should be dry',
        'Water thoroughly until it drains from the bottom',
        'Reduce watering frequency in winter months',
        'Use room temperature water to avoid shocking roots',
      ],
    },
    {
      title: 'Light Requirements',
      icon: 'white-balance-sunny',
      color: '#FFD54F',
      tips: [
        lightTip,
        'Rotate the plant weekly for even growth',
        'Watch for signs of too much light: brown, crispy leaves',
        'Signs of too little light: leggy growth, pale leaves',
      ],
    },
    {
      title: 'Humidity & Temperature',
      icon: 'thermometer',
      color: '#FF7043',
      tips: [
        'Ideal temperature: 18-24°C (65-75°F)',
        'Keep away from cold drafts and heating vents',
        plant.airPurifying
          ? 'As an air-purifying plant, it helps improve indoor air quality'
          : 'Moderate humidity levels work well for this plant',
        'Mist occasionally or use a pebble tray for humidity',
      ],
    },
    {
      title: 'Feeding',
      icon: 'leaf',
      color: '#81C784',
      tips: [
        'Feed monthly during spring and summer',
        'Use a balanced liquid fertilizer at half strength',
        'Skip fertilizing in fall and winter',
        'Over-fertilizing can burn roots - less is more',
      ],
    },
    {
      title: 'Care Level',
      icon: 'star',
      color: '#BA68C8',
      tips: [
        `Care Level: ${plant.careLevel}`,
        careDifficulty,
        'Consistency is key - establish a regular care routine',
        'Observe your plant regularly for any changes',
      ],
    },
  ];
};

// Loading Skeleton
const PlantCareSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.skeletonHeader}>
      <SkeletonLoader width={80} height={80} borderRadius={40} />
      <View style={{ marginLeft: spacing.lg, flex: 1 }}>
        <SkeletonLoader width="80%" height={24} />
        <SkeletonLoader width="60%" height={18} style={{ marginTop: 8 }} />
      </View>
    </View>
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.skeletonCard}>
        <SkeletonLoader width="40%" height={20} />
        <SkeletonLoader width="100%" height={16} style={{ marginTop: 12 }} />
        <SkeletonLoader width="90%" height={16} style={{ marginTop: 8 }} />
        <SkeletonLoader width="85%" height={16} style={{ marginTop: 8 }} />
      </View>
    ))}
  </View>
);

export const PlantCareScreen = () => {
  const { id: plantId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getPlantById } = usePlantStore();
  const { colors } = useTheme();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  useEffect(() => {
    loadPlant();
  }, [plantId]);

  const loadPlant = async () => {
    if (!plantId) return;
    setLoading(true);
    const p = await getPlantById(plantId);
    setPlant(p || null);
    setLoading(false);
  };

  const toggleSection = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(expandedSection === index ? null : index);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ModernHeader title="Plant Care" />
        <PlantCareSkeleton />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
        <ModernHeader title="Plant Care" />
        <View style={styles.notFoundContainer}>
          <MaterialCommunityIcons name="flower-tulip-outline" size={64} color={colors.neutral[300]} />
          <Text style={[styles.notFoundTitle, { color: colors.neutral[900] }]}>Plant Not Found</Text>
          <Text style={[styles.notFoundSubtitle, { color: colors.neutral[500] }]}>We couldn't find care information for this plant.</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary[600] }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const careGuide = getCareGuide(plant);
  const careLevelColor = {
    Easy: colors.semantic.success,
    Medium: colors.semantic.warning,
    Hard: colors.semantic.error,
  }[plant.careLevel];

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral[50] }]}>
      <ModernHeader title="Plant Care" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Plant Header Card */}
        <View style={[styles.plantCard, { backgroundColor: colors.neutral[0] }]}>
          <Image
            source={{ uri: plant.images[0] }}
            style={[styles.plantImage, { backgroundColor: colors.neutral[100] }]}
          />
          <View style={styles.plantInfo}>
            <Text style={[styles.plantName, { color: colors.neutral[900] }]}>{plant.name}</Text>
            <Text style={[styles.plantCategory, { color: colors.neutral[500] }]}>{plant.category}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: careLevelColor }]}>
                <MaterialCommunityIcons name="leaf" size={12} color={defaultColors.neutral[0]} />
                <Text style={styles.badgeText}>{plant.careLevel}</Text>
              </View>
              {plant.airPurifying && (
                <View style={[styles.badge, { backgroundColor: colors.primary[600] }]}>
                  <MaterialCommunityIcons name="air-filter" size={12} color={defaultColors.neutral[0]} />
                  <Text style={styles.badgeText}>Air Purifying</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Overview */}
        <View style={[styles.overviewCard, { backgroundColor: colors.neutral[0] }]}>
          <Text style={[styles.overviewTitle, { color: colors.neutral[900] }]}>Quick Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#4FC3F720' }]}>
                <MaterialCommunityIcons name="water" size={20} color="#4FC3F7" />
              </View>
              <Text style={[styles.overviewLabel, { color: colors.neutral[500] }]}>Water</Text>
              <Text style={[styles.overviewValue, { color: colors.neutral[900] }]}>Moderate</Text>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#FFD54F20' }]}>
                <MaterialCommunityIcons name="white-balance-sunny" size={20} color="#FFD54F" />
              </View>
              <Text style={[styles.overviewLabel, { color: colors.neutral[500] }]}>Light</Text>
              <Text style={[styles.overviewValue, { color: colors.neutral[900] }]}>{plant.lightPreference}</Text>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewIcon, { backgroundColor: '#BA68C820' }]}>
                <MaterialCommunityIcons name="star" size={20} color="#BA68C8" />
              </View>
              <Text style={[styles.overviewLabel, { color: colors.neutral[500] }]}>Care</Text>
              <Text style={[styles.overviewValue, { color: colors.neutral[900] }]}>{plant.careLevel}</Text>
            </View>
          </View>
        </View>

        {/* Care Sections */}
        <Text style={[styles.sectionTitle, { color: colors.neutral[900] }]}>Care Guide</Text>
        {careGuide.map((section, index) => (
          <TouchableOpacity
            key={section.title}
            style={[styles.careCard, { backgroundColor: colors.neutral[0] }]}
            onPress={() => toggleSection(index)}
            activeOpacity={0.7}
          >
            <View style={styles.careCardHeader}>
              <View style={[styles.careIcon, { backgroundColor: `${section.color}20` }]}>
                <MaterialCommunityIcons name={section.icon} size={24} color={section.color} />
              </View>
              <Text style={[styles.careTitle, { color: colors.neutral[900] }]}>{section.title}</Text>
              <MaterialCommunityIcons
                name={expandedSection === index ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.neutral[400]}
              />
            </View>
            {expandedSection === index && (
              <View style={[styles.careContent, { borderTopColor: colors.neutral[100] }]}>
                {section.tips.map((tip, tipIndex) => (
                  <View key={tipIndex} style={styles.tipRow}>
                    <View style={[styles.tipDot, { backgroundColor: section.color }]} />
                    <Text style={[styles.tipText, { color: colors.neutral[600] }]}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* View Plant Button */}
        <TouchableOpacity
          style={styles.viewPlantButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/plant/${plant.id}`);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.viewPlantButtonGradient}
          >
            <MaterialCommunityIcons name="flower-tulip" size={20} color={defaultColors.neutral[0]} />
            <Text style={styles.viewPlantButtonText}>View Plant Details</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultColors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },

  // Skeleton
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    margin: spacing.lg,
  },
  skeletonCard: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  // Not Found
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  notFoundTitle: {
    ...typography.title2,
    color: defaultColors.neutral[900],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  notFoundSubtitle: {
    ...typography.body,
    color: defaultColors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: defaultColors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    ...typography.callout,
    fontWeight: '600',
    color: defaultColors.neutral[0],
  },

  // Plant Card
  plantCard: {
    flexDirection: 'row',
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: defaultColors.neutral[100],
  },
  plantInfo: {
    flex: 1,
    marginLeft: spacing.lg,
    justifyContent: 'center',
  },
  plantName: {
    ...typography.title2,
    color: defaultColors.neutral[900],
    marginBottom: 2,
  },
  plantCategory: {
    ...typography.footnote,
    color: defaultColors.neutral[500],
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: defaultColors.neutral[0],
  },

  // Overview
  overviewCard: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  overviewTitle: {
    ...typography.title3,
    color: defaultColors.neutral[900],
    marginBottom: spacing.lg,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  overviewLabel: {
    ...typography.caption,
    color: defaultColors.neutral[500],
    marginBottom: 2,
  },
  overviewValue: {
    ...typography.footnote,
    fontWeight: '600',
    color: defaultColors.neutral[900],
  },

  // Section Title
  sectionTitle: {
    ...typography.title3,
    color: defaultColors.neutral[900],
    marginBottom: spacing.md,
  },

  // Care Cards
  careCard: {
    backgroundColor: defaultColors.neutral[0],
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  careCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  careIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  careTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: defaultColors.neutral[900],
    flex: 1,
  },
  careContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: defaultColors.neutral[100],
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  tipText: {
    ...typography.footnote,
    color: defaultColors.neutral[600],
    flex: 1,
    lineHeight: 20,
  },

  // View Plant Button
  viewPlantButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  viewPlantButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  viewPlantButtonText: {
    ...typography.callout,
    fontWeight: '700',
    color: defaultColors.neutral[0],
  },
});
