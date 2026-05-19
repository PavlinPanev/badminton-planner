import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState, MessagePanel, ScreenShell, SportHeader } from '@/components/mobile-ui';
import { SessionCard, type SessionListItem } from '@/components/session-card';
import { useAuth } from '@/auth/auth-context';
import { ApiError, apiEndpoint, readApiError } from '@/lib/api';
import { colors, spacing } from '@/theme/mobile-theme';
import type { PagedResponse } from 'badminton-shared';

const pageSize = 10;

type SessionsResponse = PagedResponse<SessionListItem>;

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
      if (!token) return;

      if (mode === 'initial') setIsLoading(true);
      if (mode === 'refresh') setIsRefreshing(true);
      if (mode === 'more') setIsLoadingMore(true);
      setError(null);

      try {
        const response = await fetch(apiEndpoint(`/sessions?page=${nextPage}&pageSize=${pageSize}`), {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {
          throw new ApiError('Unable to reach the Badminton Planner API.');
        });

        if (!response.ok) {
          const message = await readApiError(response);
          if (response.status === 401) await logout();
          throw new ApiError(message, response.status);
        }

        const body = (await response.json()) as SessionsResponse;
        setSessions((current) => (nextPage === 1 ? body.data : [...current, ...body.data]));
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

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading || isRefreshing || isLoadingMore) return;
    loadSessions(page + 1, 'more');
  }, [hasMore, isLoading, isLoadingMore, isRefreshing, loadSessions, page]);

  if (isLoading) {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.sky} size="large" />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell padded={false}>
      <FlatList
        contentContainerStyle={sessions.length ? styles.listContent : styles.emptyContent}
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <SessionCard session={item} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadSessions(1, 'refresh')} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <SportHeader
              eyebrow="Training court"
              title="Sessions"
              subtitle={total === 1 ? '1 active session ready for check-in.' : `${total} active sessions ready for check-in.`}
            />
            {error ? (
              <MessagePanel
                message={error}
                tone="rose"
                action={
                  <Pressable onPress={() => loadSessions(1)}>
                    <Text style={styles.retryText}>Retry</Text>
                  </Pressable>
                }
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No active sessions"
            message="When coaches schedule court time, it will show up here with attendance and capacity."
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.sky} />
            </View>
          ) : null
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
  retryText: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: '900',
  },
});
