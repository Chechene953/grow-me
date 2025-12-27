import React, { useRef } from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';
type IconPosition = 'left' | 'right';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  const getBackgroundColor = () => {
    if (disabled) return colors.neutral[200];
    switch (variant) {
      case 'primary':
        return colors.primary[600];
      case 'secondary':
        return colors.primary[50];
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'danger':
        return colors.semantic.error;
      default:
        return colors.primary[600];
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.neutral[400];
    switch (variant) {
      case 'primary':
        return colors.neutral[0];
      case 'secondary':
        return colors.primary[700];
      case 'outline':
        return colors.primary[600];
      case 'ghost':
        return colors.primary[600];
      case 'danger':
        return colors.neutral[0];
      default:
        return colors.neutral[0];
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1.5,
        borderColor: disabled ? colors.neutral[300] : colors.primary[400],
      };
    }
    return {};
  };

  const getShadowStyle = () => {
    if (disabled || variant === 'ghost' || variant === 'outline') {
      return {};
    }
    return shadows.sm;
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          minHeight: 36,
        };
      case 'medium':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          minHeight: 48,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl + spacing.md,
          minHeight: 56,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return typography.footnote;
      case 'medium':
        return typography.callout;
      case 'large':
        return typography.body;
    }
  };

  const iconSize = size === 'small' ? 16 : size === 'medium' ? 18 : 20;
  const textColor = getTextColor();

  const buttonStyle = [
    styles.button,
    { backgroundColor: getBackgroundColor() },
    getBorderStyle(),
    getShadowStyle(),
    getSizeStyle(),
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    getTextSize(),
    { color: textColor },
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={textColor} size="small" />;
    }

    const iconElement = icon && (
      <MaterialCommunityIcons
        name={icon}
        size={iconSize}
        color={textColor}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );

    return (
      <View style={styles.contentContainer}>
        {iconPosition === 'left' && iconElement}
        <Text style={textStyles}>{title}</Text>
        {iconPosition === 'right' && iconElement}
      </View>
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
