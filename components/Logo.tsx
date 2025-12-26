import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48,
  };

  const fontSizeMap = {
    small: 16,
    medium: 20,
    large: 28,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { width: sizeMap[size], height: sizeMap[size] }]}>
        <MaterialCommunityIcons name="leaf" size={sizeMap[size] * 0.7} color="#2E7D32" />
      </View>
      {showText && (
        <Text style={[styles.text, { fontSize: fontSizeMap[size] }]}>GrowMe</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
});


