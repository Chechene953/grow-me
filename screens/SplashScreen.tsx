import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="leaf" size={80} color="#2E7D32" />
      <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 32,
  },
});








