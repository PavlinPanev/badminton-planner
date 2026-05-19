import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/auth-context';
import { colors, radii, shadow, spacing } from '@/theme/mobile-theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError('Enter your name, email, and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await register(trimmedName, trimmedEmail, password);
      router.replace('/sessions' as never);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroCircle} />
          <Text style={styles.eyebrow}>Badminton Planner</Text>
          <Text style={styles.heroTitle}>Join the Club</Text>
          <Text style={styles.heroText}>Create an account to check sessions, attendance, and events.</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.title}>Register</Text>
          <TextInput
            autoCapitalize="words"
            editable={!isSubmitting}
            onChangeText={setName}
            placeholder="Name"
            style={styles.input}
            textContentType="name"
            value={name}
          />
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            editable={!isSubmitting}
            inputMode="email"
            onChangeText={setEmail}
            placeholder="Email"
            style={styles.input}
            textContentType="emailAddress"
            value={email}
          />
          <TextInput
            editable={!isSubmitting}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            textContentType="newPassword"
            value={password}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleRegister}
            style={({ pressed }: PressableStateCallbackType) => [
              styles.button,
              (pressed || isSubmitting) && styles.buttonPressed,
            ]}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
          </Pressable>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Link href="/login" style={styles.link}>
              Login
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    overflow: 'hidden',
    borderRadius: radii.xl,
    backgroundColor: colors.violet,
    minHeight: 190,
    justifyContent: 'flex-end',
    padding: spacing.xl,
  },
  heroCircle: {
    position: 'absolute',
    right: -30,
    top: -38,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(132,204,22,0.42)',
  },
  eyebrow: {
    color: '#d9f99d',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 35,
    marginTop: spacing.xs,
  },
  heroText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  form: {
    width: '100%',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadow,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.emerald,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  linkText: {
    color: colors.ink,
    fontSize: 14,
  },
  link: {
    color: colors.violet,
    fontSize: 14,
    fontWeight: '700',
  },
});
