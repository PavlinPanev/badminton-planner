import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="sessions" options={{ title: 'Sessions' }} />
      <Stack.Screen name="session-details" options={{ title: 'Session Details' }} />
      <Stack.Screen name="events" options={{ title: 'Events' }} />
      <Stack.Screen name="event-details" options={{ title: 'Event Details' }} />
    </Stack>
  );
}
