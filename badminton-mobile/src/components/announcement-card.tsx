import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, MobileCard } from '@/components/mobile-ui';
import { colors, spacing } from '@/theme/mobile-theme';

export type AnnouncementListItem = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  group: {
    id: number;
    title: string;
  };
  author: {
    id: number;
    name: string;
    role: string;
  };
};

export function formatAnnouncementDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function AnnouncementCard({ announcement }: { announcement: AnnouncementListItem }) {
  return (
    <MobileCard style={styles.card}>
      <View style={styles.badgeRow}>
        <Badge label={announcement.group.title} tone="violet" />
        <Badge label={announcement.author.role} tone="sky" />
      </View>
      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.meta}>◷ {formatAnnouncementDate(announcement.createdAt)}</Text>
      <Text style={styles.meta}>By {announcement.author.name}</Text>
      <Text numberOfLines={3} style={styles.content}>
        {announcement.content}
      </Text>
    </MobileCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
});
