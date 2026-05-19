import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { Badge, MobileCard, PrimaryButton, ScreenShell, SportHeader } from '@/components/mobile-ui';
import { colors, spacing } from '@/theme/mobile-theme';

export default function AccountScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Your account is not available.</Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerWrap}>
          <SportHeader
            eyebrow="Profile"
            title={user.name}
            subtitle="Keep your club identity in sync across sessions and events."
          />
        </View>

        <View style={styles.section}>
          <MobileCard style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
            <Text style={styles.label}>Role</Text>
            <View style={styles.badgeRow}>
              <Badge label={user.role} tone="emerald" />
            </View>
            <Text style={styles.label}>User id</Text>
            <Text style={styles.value}>#{user.id}</Text>
          </MobileCard>
        </View>

        <View style={styles.section}>
          <MobileCard style={styles.card}>
            <Text style={styles.label}>Account actions</Text>
            <Text style={styles.helperText}>Sign out if you are finished with attendance or event updates.</Text>
            <PrimaryButton label="Logout" onPress={logout} tone="rose" />
          </MobileCard>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  card: {
    gap: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: '800',
  },
});
