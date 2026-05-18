import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';

export default function HomeScreen() {
  const { isLoggedIn, logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Badminton Planner</Text>
      {isLoggedIn ? (
        <>
          <Text style={styles.status}>Signed in as {user?.name ?? user?.email}</Text>
          <Link href={'/sessions' as never} style={styles.link}>
            View Sessions
          </Link>
          <Link href={'/events' as never} style={styles.link}>
            View Events
          </Link>
          <Pressable style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        </>
      ) : (
        <Link href={'/login' as never} style={styles.link}>
          Go to Login
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  link: {
    fontSize: 18,
    color: '#0a66c2',
  },
  status: {
    fontSize: 16,
    color: '#3f3f46',
    textAlign: 'center',
  },
  button: {
    minWidth: 160,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#0a66c2',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
