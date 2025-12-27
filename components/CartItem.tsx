import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
}) => {
  const getImageUrl = () => {
    if (item.potColor?.images && item.potColor.images.length > 0) {
      return item.potColor.images[0];
    }
    return item.plant.images[0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl() }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.plant.name}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="close" size={18} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.size}</Text>
          </View>
          <View style={styles.badge}>
            <View style={[styles.colorDot, { backgroundColor: item.potColor.hex || colors.neutral[400] }]} />
            <Text style={styles.badgeText}>{item.potColor.name}</Text>
          </View>
        </View>

        {item.accessories.length > 0 && (
          <Text style={styles.accessories} numberOfLines={1}>
            + {item.accessories.map(a => a.name).join(', ')}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.price}>
            <Text style={styles.currencySymbol}>$</Text>
            {item.price.toFixed(2)}
          </Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => item.quantity > 1 && onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <MaterialCommunityIcons
                name="minus"
                size={16}
                color={item.quantity <= 1 ? colors.neutral[300] : colors.primary[600]}
              />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.quantity + 1)}
            >
              <MaterialCommunityIcons name="plus" size={16} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    ...typography.bodyMedium,
    color: colors.neutral[900],
    flex: 1,
    marginRight: spacing.sm,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accessories: {
    ...typography.caption,
    color: colors.primary[600],
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[700],
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  quantityButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    ...typography.bodyMedium,
    color: colors.neutral[900],
    minWidth: 24,
    textAlign: 'center',
  },
});
