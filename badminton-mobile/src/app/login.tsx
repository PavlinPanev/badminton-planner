import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Link href={'/sessions' as never} style={styles.link}>
        Go to Sessions
      </Link>
      <Link href={'/events' as never} style={styles.link}>
        Go to Events
      </Link>
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
  },
  link: {
    fontSize: 18,
    color: '#0a66c2',
  },
});
