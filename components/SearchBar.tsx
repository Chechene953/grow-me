import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search plants...',
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.shadowContainer, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={isFocused ? colors.primary[600] : colors.neutral[400]}
          />
        </View>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('');
              inputRef.current?.focus();
            }}
            style={styles.clearButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.clearButtonInner}>
              <MaterialCommunityIcons name="close" size={14} color={colors.neutral[0]} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
    ...shadows.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  containerFocused: {
    borderColor: colors.primary[400],
    backgroundColor: colors.neutral[0],
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  clearButtonInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
