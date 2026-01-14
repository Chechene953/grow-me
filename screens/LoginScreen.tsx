import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'expo-router';
import { getFirebaseErrorMessage } from '../utils/errorMessages';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, loading, signInWithGoogle } = useAuthStore();
  const router = useRouter();

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;
  const iosClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const iosClientId = iosClientIdEnv || clientId;

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'growme',
  });

  const googleConfig: Partial<Google.GoogleAuthRequestConfig> | null = clientId ? {
    clientId: clientId,
    webClientId: webClientIdEnv || clientId,
    iosClientId: iosClientId || clientId,
    androidClientId: androidClientIdEnv || clientId,
    scopes: ['profile', 'email'],
    redirectUri: redirectUri,
  } : null;

  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig || {
    clientId: '',
    iosClientId: '',
    androidClientId: '',
    webClientId: '',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    const run = async () => {
      if (!response) {
        return;
      }

      setGoogleLoading(false);

      if (response?.type === 'success') {
        const idToken = response.authentication?.idToken;

        if (idToken) {
          try {
            setError('');
            await signInWithGoogle(idToken);
          } catch (err: any) {
            setError(getFirebaseErrorMessage(err));
          }
        } else {
          setError('Failed to get authentication token from Google. Please try again.');
        }
      } else if (response?.type === 'error') {
        const errorMessage = response.error?.message || 'Google Sign-In failed';
        if (errorMessage.includes('client_id') || errorMessage.includes('invalid_request')) {
          setError('Google Sign-In is not configured. Please add EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID to your .env file.');
        } else {
          setError(getFirebaseErrorMessage({ message: errorMessage }));
        }
      } else if (response?.type === 'cancel' || response?.type === 'dismiss') {

      }
    };
    run();
  }, [response, signInWithGoogle]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setError('');
      await signIn(email, password);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
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

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-outline"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="Forgot Password?"
            onPress={() => router.push('/(auth)/forgot-password')}
            variant="outline"
            style={styles.button}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <Button
              title="Continue with Google"
              onPress={() => {
                if (!clientId) {
                  setError('Google Sign-In is not configured. Please add EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID to your .env file and restart the app.');
                  return;
                }
                if (googleLoading) {
                  return;
                }
                setGoogleLoading(true);
                promptAsync().catch(() => setGoogleLoading(false));
              }}
              disabled={!request || !clientId || googleLoading}
              loading={googleLoading}
              style={styles.socialButton}
              icon="google"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              Sign Up
            </Text>
          </View>

          <View style={styles.testCredentials}>
            <Text style={styles.testTitle}>Test Account</Text>
            <Text style={styles.testText}>Email: test@growme.com</Text>
            <Text style={styles.testText}>Password: Test123!</Text>
          </View>
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
    marginBottom: 48,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#777',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  socialRow: {
    gap: 12,
  },
  socialButton: {
    marginTop: 0,
  },
  testCredentials: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  testTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  testText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
});
