import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { ApiError, apiEndpoint, readApiError } from '@/lib/api';

const pageSize = 10;

type RegistrationState = 'registered' | 'waitlisted' | 'canceled' | 'not_registered';

type EventListItem = {
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

type EventsResponse = {
  data: EventListItem[];
  paging: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
};

function formatEventDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function registrationLabel(state: RegistrationState) {
  switch (state) {
    case 'registered':
      return 'Registered';
    case 'waitlisted':
      return 'Waitlisted';
    case 'canceled':
      return 'Canceled registration';
    default:
      return 'Not registered';
  }
}

function EventCard({ event }: { event: EventListItem }) {
  const registrationText = useMemo(
    () => (event.canceled ? 'Event canceled' : registrationLabel(event.registrationState)),
    [event.canceled, event.registrationState],
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/event-details' as never,
          params: { id: String(event.id) } as never,
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{formatEventDate(event.eventDate)}</Text>
        </View>
        <Text style={[styles.typeBadge, event.eventType === 'member' && styles.memberBadge]}>
          {event.eventType}
        </Text>
      </View>

      <Text style={styles.venue}>{event.venue.name}</Text>
      <Text style={styles.meta}>{event.venue.city}</Text>

      <View style={styles.footerRow}>
        <Text
          style={[
            styles.registrationBadge,
            event.registrationState === 'registered' && styles.registrationRegistered,
            event.registrationState === 'waitlisted' && styles.registrationWaitlisted,
            event.canceled && styles.registrationCanceled,
          ]}
        >
          {registrationText}
        </Text>
        <Text style={styles.capacity}>{event.capacity ? `${event.capacity} spots` : 'No capacity limit'}</Text>
      </View>
    </Pressable>
  );
}

export default function EventsScreen() {
  const { token, logout } = useAuth();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(
    async (nextPage: number, mode: 'initial' | 'refresh' | 'more' = 'initial') => {
      if (!token) {
        return;
      }

      if (mode === 'initial') {
        setIsLoading(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      try {
        const response = await fetch(apiEndpoint(`/events?page=${nextPage}&pageSize=${pageSize}`), {
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

        const body = (await response.json()) as EventsResponse;

        setEvents((currentEvents) => (nextPage === 1 ? body.data : [...currentEvents, ...body.data]));
        setPage(body.paging.page);
        setHasMore(body.paging.hasMore);
        setTotal(body.paging.total);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load events.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [logout, token],
  );

  useEffect(() => {
    loadEvents(1);
  }, [loadEvents]);

  const handleRefresh = useCallback(() => {
    loadEvents(1, 'refresh');
  }, [loadEvents]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading || isRefreshing || isLoadingMore) {
      return;
    }

    loadEvents(page + 1, 'more');
  }, [hasMore, isLoading, isLoadingMore, isRefreshing, loadEvents, page]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0a66c2" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>{total === 1 ? '1 upcoming event' : `${total} upcoming events`}</Text>
      </View>

      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadEvents(1)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={events.length ? styles.listContent : styles.emptyContent}
        data={events}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <EventCard event={item} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No upcoming events</Text>
            <Text style={styles.emptyText}>Public and member events will appear here when they are published.</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#0a66c2" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f8',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomColor: '#e4e4e7',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  title: {
    color: '#18181b',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#71717a',
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#e4e4e7',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardPressed: {
    opacity: 0.78,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    color: '#18181b',
    fontSize: 18,
    fontWeight: '800',
  },
  eventDate: {
    color: '#3f3f46',
    fontSize: 15,
    fontWeight: '600',
  },
  typeBadge: {
    borderRadius: 999,
    backgroundColor: '#eff6ff',
    color: '#0a66c2',
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'capitalize',
  },
  memberBadge: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
  },
  venue: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: '#52525b',
    fontSize: 14,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  registrationBadge: {
    borderRadius: 999,
    backgroundColor: '#f4f4f5',
    color: '#52525b',
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  registrationRegistered: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
  },
  registrationWaitlisted: {
    backgroundColor: '#fffbeb',
    color: '#a16207',
  },
  registrationCanceled: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  capacity: {
    color: '#71717a',
    fontSize: 13,
    fontWeight: '700',
  },
  errorPanel: {
    backgroundColor: '#fef2f2',
    borderBottomColor: '#fecaca',
    borderBottomWidth: 1,
    padding: 16,
    gap: 10,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#991b1b',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#18181b',
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 15,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 18,
  },
});
