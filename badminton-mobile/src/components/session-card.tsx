import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, MobileCard, ProgressBar } from '@/components/mobile-ui';
import { colors, spacing } from '@/theme/mobile-theme';
import type { AttendanceSummary, SessionListItem } from 'badminton-shared';

export type { AttendanceSummary, SessionListItem };

function stateTone(session: SessionListItem) {
  if (session.canceled) {
    return 'rose' as const;
  }

  if (session.state === 'current') {
    return 'amber' as const;
  }

  if (session.state === 'completed') {
    return 'neutral' as const;
  }

  return 'emerald' as const;
}

function capacityTone(session: SessionListItem) {
  if (session.capacityState === 'full') {
    return 'rose' as const;
  }

  if (session.capacityState === 'near-full') {
    return 'amber' as const;
  }

  return 'sky' as const;
}

export function SessionCard({ session }: { session: SessionListItem }) {
  const capacityValue = session.capacity ? session.attendanceSummary.attending / session.capacity : 0;
  const attendanceText = useMemo(() => {
    const pending = session.attendanceSummary['no response'];
    return `${session.attendanceSummary.attending} going · ${session.attendanceSummary.maybe} maybe · ${pending} pending`;
  }, [session.attendanceSummary]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/session-details' as never,
          params: { id: String(session.id) } as never,
        })
      }
    >
      {({ pressed }) => (
        <MobileCard pressed={pressed} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>{session.time}</Text>
            </View>
            <View style={styles.badges}>
              <Badge label={session.canceled ? 'Cancelled' : session.state} tone={stateTone(session)} />
              <Badge label={session.capacityState} tone={capacityTone(session)} />
            </View>
          </View>

          <Text style={styles.date}>{session.formattedDate}</Text>
          <Text style={styles.title}>{session.group.title}</Text>

          <View style={styles.metaGrid}>
            <Text style={styles.meta}>⌖ {session.venue.name}</Text>
            <Text style={styles.meta}>◌ {session.commentsCount} comments</Text>
          </View>

          <View style={styles.attendanceRow}>
            <View style={styles.attendanceDotGreen} />
            <Text style={styles.attendanceText}>{attendanceText}</Text>
          </View>

          <View style={styles.capacityBlock}>
            <View style={styles.capacityHeader}>
              <Text style={styles.capacityLabel}>Capacity</Text>
              <Text style={styles.capacityValue}>
                {session.capacity ? `${session.attendanceSummary.attending}/${session.capacity}` : 'No limit'}
              </Text>
            </View>
            <ProgressBar value={capacityValue} tone={capacityTone(session)} />
          </View>
        </MobileCard>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  datePill: {
    borderRadius: 16,
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  datePillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  badges: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flex: 1,
  },
  date: {
    color: colors.sky,
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 25,
  },
  metaGrid: {
    gap: 4,
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  attendanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  attendanceDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: colors.emerald,
  },
  attendanceText: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  capacityBlock: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  capacityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capacityLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  capacityValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
});
