import { Stack, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/auth-context';

const publicRoutes = new Set(['/', '/login', '/register']);

function ProtectedStack() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isLoggedIn } = useAuth();
  const isPublicRoute = publicRoutes.has(pathname);

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !isPublicRoute) {
      router.replace('/login' as never);
    }
  }, [isLoading, isLoggedIn, isPublicRoute, router]);

  if (isLoading || (!isLoggedIn && !isPublicRoute)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a66c2" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="sessions" options={{ title: 'Sessions' }} />
      <Stack.Screen name="session-details" options={{ title: 'Session Details' }} />
      <Stack.Screen name="announcements" options={{ title: 'Announcements' }} />
      <Stack.Screen name="events" options={{ title: 'Events' }} />
      <Stack.Screen name="event-details" options={{ title: 'Event Details' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProtectedStack />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
