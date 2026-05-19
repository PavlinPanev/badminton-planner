import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, MobileCard } from '@/components/mobile-ui';
import { colors, spacing } from '@/theme/mobile-theme';
import type { GroupListItem, GroupRole } from 'badminton-shared';

function roleTone(role: GroupRole) {
  switch (role) {
    case 'manager':
      return 'emerald' as const;
    case 'coach':
      return 'sky' as const;
    case 'parent':
      return 'violet' as const;
    default:
      return 'amber' as const;
  }
}

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function GroupCard({ group }: { group: GroupListItem }) {
  const roleLabels = useMemo(() => group.roles.map(formatRole), [group.roles]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/group-details' as never,
          params: { id: String(group.id) } as never,
        })
      }
    >
      {({ pressed }) => (
        <MobileCard pressed={pressed} style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.levelPill}>
              <Text style={styles.levelText}>{group.level}</Text>
            </View>
            <Text style={styles.ageText}>{group.ageRangeLabel}</Text>
          </View>
          <Text style={styles.title}>{group.title}</Text>
          {group.description ? <Text style={styles.description}>{group.description}</Text> : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>⌖ {group.venue.name}, {group.venue.city}</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statText}>{group.stats.memberCount} members</Text>
            <Text style={styles.statText}>{group.stats.playerCount} players</Text>
            <Text style={styles.statText}>{group.stats.sessionCount} sessions</Text>
          </View>

          <View style={styles.badgeRow}>
            {group.roles.map((role, index) => (
              <Badge key={`${role}-${index}`} label={roleLabels[index] ?? role} tone={roleTone(role)} />
            ))}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  levelPill: {
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  ageText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaText: {
    color: colors.sky,
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
