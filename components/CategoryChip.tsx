import React, { useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Low Light': 'lightbulb-outline',
  'Air Purifying': 'air-filter',
  'Easy Care': 'heart-outline',
  'Succulents': 'cactus',
  'Flowering': 'flower',
  'Large Plants': 'tree',
  'Small Plants': 'sprout',
  'Pet Friendly': 'paw',
  'Tropical': 'palm-tree',
  'Cacti': 'cactus',
  'Herbs': 'leaf',
  'Outdoor': 'weather-sunny',
  'Indoor': 'home-outline',
};

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  selected = false,
  onPress,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const iconName = CATEGORY_ICONS[label] || 'leaf';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.chip,
          selected
            ? [styles.chipSelected, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }]
            : [styles.chipUnselected, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }],
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={14}
            color={selected ? colors.neutral[0] : colors.primary[600]}
          />
        </View>
        <Text style={[styles.text, { color: colors.primary[700] }, selected && { color: colors.neutral[0] }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  chipUnselected: {
    backgroundColor: defaultColors.primary[50],
    borderWidth: 1,
    borderColor: defaultColors.primary[200],
  },
  chipSelected: {
    backgroundColor: defaultColors.primary[600],
    borderWidth: 1,
    borderColor: defaultColors.primary[600],
    ...shadows.sm,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  text: {
    ...typography.footnote,
    color: defaultColors.primary[700],
    fontWeight: '600',
  },
  textSelected: {
    color: defaultColors.neutral[0],
  },
});
