import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, MobileCard, ProgressBar } from '@/components/mobile-ui';
import { colors, spacing } from '@/theme/mobile-theme';

export type RegistrationState = 'registered' | 'waitlisted' | 'canceled' | 'not_registered';

export type EventListItem = {
  id: number;
  title: string;
  description: string | null;
  eventType: 'public' | 'member';
  eventDate: string;
  capacity: number | null;
  canceled: boolean;
  registrationState: RegistrationState;
  venue: {
    id: number;
    name: string;
    city: string;
  };
};

export function formatEventDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function registrationLabel(state: RegistrationState) {
  switch (state) {
    case 'registered':
      return 'Registered';
    case 'waitlisted':
      return 'Waitlisted';
    case 'canceled':
      return 'Canceled registration';
    default:
      return 'Open to register';
  }
}

function registrationTone(state: RegistrationState, canceled: boolean) {
  if (canceled || state === 'canceled') {
    return 'rose' as const;
  }

  if (state === 'registered') {
    return 'emerald' as const;
  }

  if (state === 'waitlisted') {
    return 'amber' as const;
  }

  return 'violet' as const;
}

function categoryForTitle(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('camp')) return 'Camp';
  if (normalized.includes('tournament') || normalized.includes('cup')) return 'Tournament';
  if (normalized.includes('social') || normalized.includes('friendly')) return 'Social';
  return 'Club activity';
}

export function EventCard({ event }: { event: EventListItem }) {
  const registrationText = useMemo(
    () => (event.canceled ? 'Event canceled' : registrationLabel(event.registrationState)),
    [event.canceled, event.registrationState],
  );
  const category = categoryForTitle(event.title);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/event-details' as never,
          params: { id: String(event.id) } as never,
        })
      }
    >
      {({ pressed }) => (
        <MobileCard pressed={pressed} style={styles.card}>
          <View style={styles.artBand}>
            <View style={styles.artCircle} />
            <Text style={styles.artText}>BADMINTON CLUB</Text>
          </View>
          <View style={styles.badgeRow}>
            <Badge label={category} tone="amber" />
            <Badge label={event.eventType} tone={event.eventType === 'member' ? 'emerald' : 'sky'} />
          </View>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.date}>◷ {formatEventDate(event.eventDate)}</Text>
          <Text style={styles.venue}>⌖ {event.venue.name}, {event.venue.city}</Text>

          <View style={styles.statusRow}>
            <Badge label={registrationText} tone={registrationTone(event.registrationState, event.canceled)} />
            <Text style={styles.capacity}>{event.capacity ? `${event.capacity} spots` : 'No limit'}</Text>
          </View>
          <ProgressBar value={event.registrationState === 'registered' ? 0.65 : 0.32} tone="violet" />
        </MobileCard>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  artBand: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: colors.violet,
    minHeight: 74,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  artCircle: {
    position: 'absolute',
    right: -18,
    top: -26,
    width: 96,
    height: 96,
    borderRadius: 99,
    backgroundColor: 'rgba(132,204,22,0.42)',
  },
  artText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 25,
  },
  date: {
    color: colors.sky,
    fontSize: 14,
    fontWeight: '900',
  },
  venue: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  capacity: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
});
