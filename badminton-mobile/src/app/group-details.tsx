import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { Badge, MobileCard, PrimaryButton, ScreenShell, SportHeader, StatTile } from '@/components/mobile-ui';
import { ApiError, apiEndpoint, readApiError } from '@/lib/api';
import { colors, spacing } from '@/theme/mobile-theme';
import type { GroupDetail, GroupDetailResponse } from 'badminton-shared';

function formatDate(value: string) {
  const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':');
  return [hours, minutes].filter(Boolean).join(':') || value;
}

function roleTone(role: string) {
  if (role === 'manager') return 'emerald' as const;
  if (role === 'coach') return 'sky' as const;
  if (role === 'parent') return 'violet' as const;
  return 'amber' as const;
}

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token, logout } = useAuth();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupId = Number(id);
  const canLoadGroup = Number.isInteger(groupId) && Boolean(token);

  const loadGroup = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!canLoadGroup) {
        setError('Group id is missing.');
        setIsLoading(false);
        return;
      }

      if (mode === 'initial') {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const response = await fetch(apiEndpoint(`/groups/${groupId}?pageSize=6`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          throw new ApiError('Unable to reach the Badminton Planner API.');
        });

        if (!response.ok) {
          const message = await readApiError(response);

          if (response.status === 401) {
            await logout();
          }

          throw new ApiError(message, response.status);
        }

        const body = (await response.json()) as GroupDetailResponse;
        setGroup(body.data);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load group details.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [canLoadGroup, groupId, logout, token],
  );

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const heroSubtitle = useMemo(() => {
    if (!group) return '';
    return `${group.stats.memberCount} members · ${group.stats.playerCount} players · ${group.stats.sessionCount} sessions`;
  }, [group]);

  if (isLoading) {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.sky} size="large" />
        </View>
      </ScreenShell>
    );
  }

  if (!group) {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error ?? 'Group details are unavailable.'}</Text>
          <PrimaryButton label="Retry" onPress={() => loadGroup()} tone="sky" />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell padded={false}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadGroup('refresh')} />}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerWrap}>
          <SportHeader eyebrow="Training crew" title={group.title} subtitle={heroSubtitle} />
        </View>

        <View style={styles.statGrid}>
          <StatTile label="Members" value={group.stats.memberCount} tone="emerald" icon="◌" />
          <StatTile label="Players" value={group.stats.playerCount} tone="sky" icon="◇" />
          <StatTile label="Sessions" value={group.stats.sessionCount} tone="violet" icon="◷" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Overview</Text>
          <MobileCard style={styles.cardGap}>
            <View style={styles.badgeRow}>
              <Badge label={group.level} tone="emerald" />
              <Badge label={group.ageRangeLabel} tone="neutral" />
            </View>
            <Text style={styles.metaText}>⌖ {group.venue.name}, {group.venue.city}</Text>
            <Text style={styles.metaMuted}>{group.venue.address}</Text>
            {group.description ? <Text style={styles.bodyText}>{group.description}</Text> : null}
          </MobileCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Coaches</Text>
          {group.coaches.length ? (
            <View style={styles.cardStack}>
              {group.coaches.map((coach) => (
                <MobileCard key={coach.id} style={styles.coachCard}>
                  <Text style={styles.titleText}>{coach.name}</Text>
                  <Text style={styles.metaMuted}>{coach.email}</Text>
                  <View style={styles.badgeRow}>
                    <Badge label={formatRole(coach.role)} tone={roleTone(coach.role)} />
                  </View>
                </MobileCard>
              ))}
            </View>
          ) : (
            <Text style={styles.metaMuted}>No coaches assigned yet.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Upcoming sessions</Text>
          {group.sessions.length ? (
            <View style={styles.cardStack}>
              {group.sessions.slice(0, 5).map((session) => (
                <Pressable
                  key={session.id}
                  onPress={() =>
                    router.push({
                      pathname: '/session-details' as never,
                      params: { id: String(session.id) } as never,
                    })
                  }
                >
                  {({ pressed }) => (
                    <MobileCard pressed={pressed} style={styles.sessionCard}>
                      <Text style={styles.titleText}>{formatDate(session.sessionDate)}</Text>
                      <Text style={styles.metaText}>◷ {formatTime(session.startTime)} · {session.venueName}</Text>
                      <View style={styles.badgeRow}>
                        <Badge label={session.state} tone={session.canceled ? 'rose' : 'sky'} />
                        {session.coachName ? <Badge label={session.coachName} tone="neutral" /> : null}
                      </View>
                    </MobileCard>
                  )}
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.metaMuted}>No sessions scheduled yet.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Latest announcements</Text>
          {group.announcements.length ? (
            <View style={styles.cardStack}>
              {group.announcements.slice(0, 4).map((announcement) => (
                <MobileCard key={announcement.id} style={styles.announcementCard}>
                  <Text style={styles.titleText}>{announcement.title}</Text>
                  <Text style={styles.metaMuted}>By {announcement.authorName} · {announcement.authorRole}</Text>
                  <Text style={styles.bodyText}>{announcement.content}</Text>
                </MobileCard>
              ))}
            </View>
          ) : (
            <Text style={styles.metaMuted}>No announcements shared yet.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    color: colors.rose,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    paddingBottom: spacing.xl,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionEyebrow: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardGap: {
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.sky,
    fontSize: 13,
    fontWeight: '800',
  },
  metaMuted: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardStack: {
    gap: spacing.md,
  },
  coachCard: {
    gap: spacing.xs,
  },
  sessionCard: {
    gap: spacing.xs,
  },
  announcementCard: {
    gap: spacing.xs,
  },
  titleText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
});
