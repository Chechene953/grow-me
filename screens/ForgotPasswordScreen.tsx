import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'expo-router';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuthStore();
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setError('');
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successText}>
            We've sent a password reset link to {email}
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.push('/(auth)/login')}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset link
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="email-outline"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Send Reset Link"
            onPress={handleReset}
            style={styles.button}
          />

          <Button
            title="Back to Login"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
});








