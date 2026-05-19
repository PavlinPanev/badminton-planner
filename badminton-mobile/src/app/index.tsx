import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { MobileCard, PrimaryButton, ScreenShell, SportHeader, StatTile } from '@/components/mobile-ui';
import type { SessionListItem } from '@/components/session-card';
import type { EventListItem } from '@/components/event-card';
import { ApiError, apiEndpoint, readApiError } from '@/lib/api';
import { colors, spacing } from '@/theme/mobile-theme';
import type { PagedResponse } from 'badminton-shared';

type SessionsResponse = PagedResponse<SessionListItem>;

type EventsResponse = PagedResponse<EventListItem>;

type DashboardStats = {
  sessionsTotal: number;
  attendancePending: number;
  eventsOpen: number;
  groupsTotal: number;
};

export default function HomeScreen() {
  const { isLoggedIn, logout, token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    sessionsTotal: 0,
    attendancePending: 0,
    eventsOpen: 0,
    groupsTotal: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token) return;

    setIsLoadingStats(true);
    setError(null);

    try {
      const [sessionsResponse, eventsResponse] = await Promise.all([
        fetch(apiEndpoint('/sessions?page=1&pageSize=50'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(apiEndpoint('/events?page=1&pageSize=50'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!sessionsResponse.ok) {
        const message = await readApiError(sessionsResponse);
        if (sessionsResponse.status === 401) await logout();
        throw new ApiError(message, sessionsResponse.status);
      }

      if (!eventsResponse.ok) {
        const message = await readApiError(eventsResponse);
        if (eventsResponse.status === 401) await logout();
        throw new ApiError(message, eventsResponse.status);
      }

      const sessionsBody = (await sessionsResponse.json()) as SessionsResponse;
      const eventsBody = (await eventsResponse.json()) as EventsResponse;
      const groups = new Set(sessionsBody.data.map((session) => session.group.id));

      setStats({
        sessionsTotal: sessionsBody.paging.total,
        attendancePending: sessionsBody.data.reduce(
          (total, session) => total + session.attendanceSummary['no response'],
          0,
        ),
        eventsOpen: eventsBody.paging.total,
        groupsTotal: groups.size,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load dashboard.');
    } finally {
      setIsLoadingStats(false);
    }
  }, [logout, token]);

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboard();
    }
  }, [isLoggedIn, loadDashboard]);

  const greeting = useMemo(() => {
    const firstName = user?.name?.split(' ')[0] ?? 'there';
    return `Hi ${firstName}`;
  }, [user?.name]);

  return (
    <ScreenShell padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.padded}>
          <SportHeader
            eyebrow="Badminton club"
            title={isLoggedIn ? greeting : 'Play, train, belong'}
            subtitle={
              isLoggedIn
                ? 'Your sessions, events, and attendance are ready for the next rally.'
                : 'A colorful club companion for sessions, attendance, venues, and events.'
            }
            action={
              isLoggedIn ? (
                <View style={styles.heroActions}>
                  <PrimaryButton label="View sessions" onPress={() => router.push('/sessions' as never)} tone="emerald" />
                  <Pressable style={styles.heroGhostButton} onPress={logout}>
                    <Text style={styles.heroGhostText}>Logout</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.heroActions}>
                  <PrimaryButton label="Login" onPress={() => router.push('/login' as never)} tone="emerald" />
                </View>
              )
            }
          />
        </View>

        {isLoggedIn ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>Club snapshot</Text>
              <Text style={styles.sectionTitle}>Today’s scoreboard</Text>
            </View>

            {isLoadingStats ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator color={colors.sky} />
              </View>
            ) : (
              <View style={styles.statGrid}>
                <StatTile label="Upcoming sessions" value={stats.sessionsTotal} tone="sky" icon="◷" />
                <StatTile label="Attendance pending" value={stats.attendancePending} tone="amber" icon="?" />
                <StatTile label="Events open" value={stats.eventsOpen} tone="violet" icon="◇" />
                <StatTile label="My groups" value={stats.groupsTotal} tone="emerald" icon="◌" />
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.quickGrid}>
              <Pressable onPress={() => router.push('/sessions' as never)}>
                {({ pressed }) => (
                  <MobileCard pressed={pressed} style={styles.quickCard}>
                    <Text style={styles.quickIcon}>◷</Text>
                    <Text style={styles.quickTitle}>Check attendance</Text>
                    <Text style={styles.quickText}>Mark going, maybe, or not attending before court time.</Text>
                  </MobileCard>
                )}
              </Pressable>
              <Pressable onPress={() => router.push('/events' as never)}>
                {({ pressed }) => (
                  <MobileCard pressed={pressed} style={styles.quickCard}>
                    <Text style={styles.quickIcon}>◇</Text>
                    <Text style={styles.quickTitle}>Find club events</Text>
                    <Text style={styles.quickText}>Camps, socials, and tournaments in one friendly place.</Text>
                  </MobileCard>
                )}
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.padded}>
            <MobileCard style={styles.welcomeCard}>
              <Text style={styles.quickIcon}>V</Text>
              <Text style={styles.quickTitle}>Ready when your club account is</Text>
              <Text style={styles.quickText}>
                Login to see group sessions, attendance actions, comments, venues, and upcoming events.
              </Text>
            </MobileCard>
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: spacing.lg,
  },
  heroGhostText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionEyebrow: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: '800',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  quickGrid: {
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  quickCard: {
    gap: spacing.sm,
  },
  welcomeCard: {
    gap: spacing.sm,
  },
  quickIcon: {
    color: colors.violet,
    fontSize: 28,
    fontWeight: '900',
  },
  quickTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  quickText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
