import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AnnouncementCard } from '@/components/announcement-card';
import { EmptyState, MessagePanel, ScreenShell, SportHeader } from '@/components/mobile-ui';
import { useAuth } from '@/auth/auth-context';
import { ApiError, apiEndpoint, readApiError } from '@/lib/api';
import { colors, spacing } from '@/theme/mobile-theme';
import type { AnnouncementListItem, AnnouncementsResponse } from 'badminton-shared';

const pageSize = 10;

export default function AnnouncementsScreen() {
  const { token, logout } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncements = useCallback(
    async (nextPage: number, mode: 'initial' | 'refresh' | 'more' = 'initial') => {
      if (!token) return;

      if (mode === 'initial') setIsLoading(true);
      if (mode === 'refresh') setIsRefreshing(true);
      if (mode === 'more') setIsLoadingMore(true);
      setError(null);

      try {
        const response = await fetch(apiEndpoint(`/announcements?page=${nextPage}&pageSize=${pageSize}`), {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {
          throw new ApiError('Unable to reach the Badminton Planner API.');
        });

        if (!response.ok) {
          const message = await readApiError(response);
          if (response.status === 401) await logout();
          throw new ApiError(message, response.status);
        }

        const body = (await response.json()) as AnnouncementsResponse;
        setAnnouncements((current) => (nextPage === 1 ? body.data : [...current, ...body.data]));
        setPage(body.paging.page);
        setHasMore(body.paging.hasMore);
        setTotal(body.paging.total);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load announcements.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [logout, token],
  );

  useEffect(() => {
    loadAnnouncements(1);
  }, [loadAnnouncements]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading || isRefreshing || isLoadingMore) return;
    loadAnnouncements(page + 1, 'more');
  }, [hasMore, isLoading, isLoadingMore, isRefreshing, loadAnnouncements, page]);

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
        contentContainerStyle={announcements.length ? styles.listContent : styles.emptyContent}
        data={announcements}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <AnnouncementCard announcement={item} />}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadAnnouncements(1, 'refresh')} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <SportHeader
              eyebrow="Club updates"
              title="Announcements"
              subtitle={
                total === 1
                  ? '1 announcement from your groups.'
                  : `${total} announcements from your training groups.`
              }
            />
            {error ? (
              <MessagePanel
                message={error}
                tone="rose"
                action={
                  <Pressable onPress={() => loadAnnouncements(1)}>
                    <Text style={styles.retryText}>Retry</Text>
                  </Pressable>
                }
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No announcements yet"
            message="Group announcements will appear here when coaches or managers share updates."
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
