import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ModernHeader } from '../components/ModernHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface CareTip {
  category: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  tips: { title: string; description: string }[];
}

const CARE_TIPS: CareTip[] = [
  {
    category: 'Watering',
    icon: 'water',
    color: '#4FC3F7',
    tips: [
      { title: 'Check soil moisture', description: 'Water when the top inch of soil is dry to touch' },
      { title: 'Use room temperature water', description: 'Cold water can shock plant roots and stress the plant' },
      { title: 'Avoid overwatering', description: 'Root rot is the #1 killer of houseplants - less is often more' },
      { title: 'Drainage is key', description: 'Ensure pots have drainage holes to prevent waterlogging' },
    ],
  },
  {
    category: 'Lighting',
    icon: 'white-balance-sunny',
    color: '#FFD54F',
    tips: [
      { title: 'Know your light levels', description: 'Most indoor plants prefer bright, indirect light' },
      { title: 'Rotate regularly', description: 'Turn plants weekly for even growth on all sides' },
      { title: 'Avoid direct sun', description: 'Direct sunlight can burn leaves on most houseplants' },
      { title: 'Low light alternatives', description: 'Snake plants and pothos thrive in darker corners' },
    ],
  },
  {
    category: 'Fertilizing',
    icon: 'leaf',
    color: '#81C784',
    tips: [
      { title: 'Growing season feeding', description: 'Fertilize during spring and summer when plants are actively growing' },
      { title: 'Dilute your fertilizer', description: 'Use half the recommended strength to avoid fertilizer burn' },
      { title: 'Skip winter feeding', description: 'Most plants go dormant in winter and don\'t need extra nutrients' },
      { title: 'Read the signs', description: 'Yellow leaves can indicate over-fertilization' },
    ],
  },
  {
    category: 'Pruning',
    icon: 'scissors-cutting',
    color: '#F06292',
    tips: [
      { title: 'Remove dead foliage', description: 'Cut off yellow or brown leaves to redirect energy to healthy growth' },
      { title: 'Encourage bushiness', description: 'Pinch growing tips to promote fuller, more compact plants' },
      { title: 'Use clean tools', description: 'Sterilize scissors before pruning to prevent disease spread' },
      { title: 'Time it right', description: 'Best to prune in spring when plants enter active growth' },
    ],
  },
  {
    category: 'Repotting',
    icon: 'pot-outline',
    color: '#A1887F',
    tips: [
      { title: 'Watch for root bound signs', description: 'Roots circling the pot or coming out of drainage holes' },
      { title: 'Size up gradually', description: 'Choose a pot only 1-2 inches larger than the current one' },
      { title: 'Fresh soil matters', description: 'Use well-draining potting mix appropriate for your plant type' },
      { title: 'Best time to repot', description: 'Spring is ideal - the plant can recover during active growth' },
    ],
  },
  {
    category: 'Humidity',
    icon: 'water-percent',
    color: '#4DD0E1',
    tips: [
      { title: 'Group plants together', description: 'Plants release moisture and create a humid microclimate' },
      { title: 'Pebble trays work', description: 'Place pots on trays filled with water and pebbles' },
      { title: 'Misting helps some', description: 'Tropical plants benefit from regular misting' },
      { title: 'Avoid dry air', description: 'Keep plants away from heating vents and radiators' },
    ],
  },
];

const TipCard: React.FC<{
  tip: CareTip;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ tip, isExpanded, onToggle }) => {
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onToggle();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.tipCard}>
      <TouchableOpacity
        style={styles.tipCardHeader}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.tipIconContainer, { backgroundColor: `${tip.color}20` }]}>
          <MaterialCommunityIcons name={tip.icon} size={24} color={tip.color} />
        </View>
        <View style={styles.tipHeaderText}>
          <Text style={styles.tipCategory}>{tip.category}</Text>
          <Text style={styles.tipCount}>{tip.tips.length} tips</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color={colors.neutral[400]}
          />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.tipCardContent}>
          {tip.tips.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tipItem,
                index === tip.tips.length - 1 && styles.tipItemLast,
              ]}
            >
              <View style={[styles.tipBullet, { backgroundColor: tip.color }]}>
                <Text style={styles.tipBulletText}>{index + 1}</Text>
              </View>
              <View style={styles.tipItemContent}>
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text style={styles.tipDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export const CareTipsScreen = () => {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <ModernHeader title="Plant Care Tips" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={styles.heroCard}
        >
          <View style={styles.heroIconContainer}>
            <MaterialCommunityIcons name="leaf" size={32} color={colors.neutral[0]} />
          </View>
          <Text style={styles.heroTitle}>Grow Like a Pro</Text>
          <Text style={styles.heroSubtitle}>
            Essential tips to keep your plants thriving all year round
          </Text>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Tips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Min Read</Text>
          </View>
        </View>

        {/* Tips List */}
        <View style={styles.tipsContainer}>
          {CARE_TIPS.map((tip, index) => (
            <TipCard
              key={tip.category}
              tip={tip}
              isExpanded={expandedIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </View>

        {/* Pro Tip Banner */}
        <View style={styles.proTipBanner}>
          <View style={styles.proTipIcon}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color={colors.accent.gold} />
          </View>
          <View style={styles.proTipContent}>
            <Text style={styles.proTipTitle}>Pro Tip</Text>
            <Text style={styles.proTipText}>
              Consistency is key! Set reminders to check on your plants at the same time each week.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },

  // Hero
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.title1,
    color: colors.neutral[0],
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral[100],
  },
  statNumber: {
    ...typography.title1,
    color: colors.primary[600],
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral[500],
  },

  // Tips
  tipsContainer: {
    gap: spacing.md,
  },
  tipCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  tipCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipHeaderText: {
    flex: 1,
  },
  tipCategory: {
    ...typography.title3,
    color: colors.neutral[900],
  },
  tipCount: {
    ...typography.footnote,
    color: colors.neutral[500],
    marginTop: 2,
  },
  tipCardContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: spacing.md,
  },
  tipItemLast: {
    borderBottomWidth: 0,
  },
  tipBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipBulletText: {
    ...typography.footnote,
    fontWeight: '700',
    color: colors.neutral[0],
  },
  tipItemContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  tipDescription: {
    ...typography.footnote,
    color: colors.neutral[500],
    lineHeight: 20,
  },

  // Pro Tip
  proTipBanner: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent.gold}15`,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  proTipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.accent.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proTipContent: {
    flex: 1,
  },
  proTipTitle: {
    ...typography.callout,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  proTipText: {
    ...typography.footnote,
    color: colors.neutral[600],
    lineHeight: 20,
  },
});
