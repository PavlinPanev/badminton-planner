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

type AttendanceSummary = {
  attending: number;
  absent: number;
  maybe: number;
  'no response': number;
};

type SessionListItem = {
  id: number;
  group: {
    id: number;
    title: string;
  };
  venue: {
    name: string;
  };
  date: string;
  formattedDate: string;
  time: string;
  state: string;
  canceled: boolean;
  capacity: number;
  capacityState: string;
  attendanceSummary: AttendanceSummary;
  commentsCount: number;
};

type SessionsResponse = {
  data: SessionListItem[];
  paging: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
};

function formatAttendanceStatus(summary: AttendanceSummary) {
  const pending = summary['no response'];
  const parts = [`${summary.attending} attending`];

  if (summary.maybe > 0) {
    parts.push(`${summary.maybe} maybe`);
  }

  if (summary.absent > 0) {
    parts.push(`${summary.absent} absent`);
  }

  if (pending > 0) {
    parts.push(`${pending} pending`);
  }

  return parts.join(' · ');
}

function SessionCard({ session }: { session: SessionListItem }) {
  const attendanceStatus = useMemo(
    () => formatAttendanceStatus(session.attendanceSummary),
    [session.attendanceSummary],
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/session-details' as never,
          params: { id: String(session.id) } as never,
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateBlock}>
          <Text style={styles.date}>{session.formattedDate}</Text>
          <Text style={styles.time}>{session.time}</Text>
        </View>
        <Text style={[styles.stateBadge, session.canceled && styles.canceledBadge]}>
          {session.canceled ? 'Canceled' : session.state}
        </Text>
      </View>

      <Text style={styles.group}>{session.group.title}</Text>
      <Text style={styles.meta}>{session.venue.name}</Text>
      <Text style={styles.attendance}>{attendanceStatus}</Text>
    </Pressable>
  );
}

export default function SessionsScreen() {
  const { token, logout } = useAuth();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(
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
        const response = await fetch(apiEndpoint(`/sessions?page=${nextPage}&pageSize=${pageSize}`), {
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

        const body = (await response.json()) as SessionsResponse;

        setSessions((currentSessions) =>
          nextPage === 1 ? body.data : [...currentSessions, ...body.data],
        );
        setPage(body.paging.page);
        setHasMore(body.paging.hasMore);
        setTotal(body.paging.total);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load sessions.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [logout, token],
  );

  useEffect(() => {
    loadSessions(1);
  }, [loadSessions]);

  const handleRefresh = useCallback(() => {
    loadSessions(1, 'refresh');
  }, [loadSessions]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading || isRefreshing || isLoadingMore) {
      return;
    }

    loadSessions(page + 1, 'more');
  }, [hasMore, isLoading, isLoadingMore, isRefreshing, loadSessions, page]);

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
        <Text style={styles.title}>Sessions</Text>
        <Text style={styles.subtitle}>
          {total === 1 ? '1 active session' : `${total} active sessions`}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadSessions(1)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={sessions.length ? styles.listContent : styles.emptyContent}
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <SessionCard session={item} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active sessions</Text>
            <Text style={styles.emptyText}>Active sessions will appear here when they are scheduled.</Text>
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
  dateBlock: {
    flex: 1,
    gap: 2,
  },
  date: {
    color: '#18181b',
    fontSize: 17,
    fontWeight: '700',
  },
  time: {
    color: '#3f3f46',
    fontSize: 15,
    fontWeight: '600',
  },
  stateBadge: {
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'capitalize',
  },
  canceledBadge: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  group: {
    color: '#18181b',
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: '#52525b',
    fontSize: 15,
  },
  attendance: {
    color: '#0a66c2',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
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
