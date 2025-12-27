import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { getFirebaseErrorMessage } from '../utils/errorMessages';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading, signInWithGoogle, signInWithApple } = useAuthStore();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;
  const iosClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const iosClientId = iosClientIdEnv || expoClientId;

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  const googleConfig: Parameters<typeof Google.useAuthRequest>[0] | null = expoClientId ? {
    expoClientId: expoClientId,
    webClientId: webClientIdEnv || expoClientId,
    iosClientId: iosClientId || expoClientId,
    androidClientId: androidClientIdEnv || expoClientId,
    scopes: ['profile', 'email'],
    redirectUri: redirectUri,
  } : null;

  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig || {
    expoClientId: '',
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
            onPress={() => navigation.navigate('ForgotPassword')}
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
                if (!expoClientId) {
                  setError('Google Sign-In is not configured. Please add EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID to your .env file and restart the app.');
                  return;
                }
                promptAsync();
              }}
              disabled={!request || !expoClientId}
              style={styles.socialButton}
              icon="google"
            />

            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={8}
                style={styles.appleButton}
                onPress={async () => {
                  try {
                    const array = new Uint8Array(32);
                    for (let i = 0; i < 32; i++) {
                      array[i] = Math.floor(Math.random() * 256);
                    }
                    const nonce = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
                    const credential = await AppleAuthentication.signInAsync({
                      requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                        AppleAuthentication.AppleAuthenticationScope.EMAIL,
                      ],
                      state: nonce,
                    });
                    if (credential.identityToken) {
                      await signInWithApple(credential.identityToken, nonce, {
                        name: `${credential.fullName?.givenName || ''} ${credential.fullName?.familyName || ''}`.trim() || undefined,
                        email: credential.email || undefined,
                      });
                    }
                  } catch (err: any) {
                    if (err?.code === 'ERR_CANCELED') return;
                    setError(getFirebaseErrorMessage(err));
                  }
                }}
              />
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate('SignUp')}
            >
              Sign Up
            </Text>
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
  appleButton: {
    height: 44,
    width: '100%',
    marginTop: 8,
  },
});
