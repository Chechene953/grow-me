import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { colors as defaultColors, spacing, borderRadius, shadows, typography } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  required = false,
  secureTextEntry,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = error
    ? colors.semantic.error
    : borderColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.neutral[200], colors.primary[400]],
      });

  const backgroundColor = error
    ? `${colors.semantic.error}08`
    : borderColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.neutral[50], colors.primary[50]],
      });

  const isPassword = secureTextEntry !== undefined;
  const showPassword = isPassword && !isPasswordVisible;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.neutral[700] }, isFocused && { color: colors.primary[600] }, error && { color: colors.semantic.error }]}>
            {label}
          </Text>
          {required && <Text style={[styles.requiredIndicator, { color: colors.semantic.error }]}>*</Text>}
        </View>
      )}
      <Animated.View style={[styles.inputContainer, { borderColor, backgroundColor }, error && styles.inputContainerError]}>
        {icon && (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={error ? colors.semantic.error : isFocused ? colors.primary[600] : colors.neutral[400]}
            />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            { color: colors.neutral[900] },
            icon && styles.inputWithIcon,
            isPassword && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={colors.neutral[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.neutral[400]}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={14}
            color={colors.semantic.error}
          />
          <Text style={[styles.errorText, { color: colors.semantic.error }]}>{error}</Text>
        </View>
      )}
      {hint && !error && (
        <Text style={[styles.hintText, { color: colors.neutral[500] }]}>{hint}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.footnote,
    fontWeight: '600',
    color: defaultColors.neutral[700],
  },
  labelFocused: {
    color: defaultColors.primary[600],
  },
  labelError: {
    color: defaultColors.semantic.error,
  },
  requiredIndicator: {
    color: defaultColors.semantic.error,
    marginLeft: 2,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: defaultColors.neutral[200],
    borderRadius: borderRadius.lg,
    backgroundColor: defaultColors.neutral[0],
    minHeight: 52,
    ...shadows.xs,
  },
  inputContainerError: {
    borderColor: defaultColors.semantic.error,
  },
  iconContainer: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: defaultColors.neutral[900],
    fontWeight: '500',
  },
  inputWithIcon: {
    paddingLeft: spacing.xl + spacing.lg,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xl + spacing.lg,
  },
  visibilityButton: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: defaultColors.semantic.error,
  },
  hintText: {
    ...typography.caption,
    color: defaultColors.neutral[500],
    marginTop: spacing.xs,
  },
});
