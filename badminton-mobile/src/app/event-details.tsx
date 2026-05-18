import { useLocalSearchParams } from 'expo-router';
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
import { ApiError, apiEndpoint, readApiError } from '@/lib/api';

type RegistrationState = 'registered' | 'waitlisted' | 'canceled' | 'not_registered';

type EventRegistration = {
  id: number;
  status: Exclude<RegistrationState, 'not_registered'>;
  registeredAt: string;
  userName: string;
  playerName: string | null;
};

type EventDetail = {
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
    address: string;
    city: string;
  };
  registrations: EventRegistration[];
};

type EventDetailResponse = {
  data: EventDetail;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
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
      return 'Registration canceled';
    default:
      return 'Not registered';
  }
}

function formatRegistrationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function DetailTile({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.detailTile}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token, logout } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const eventId = Number(id);
  const canLoadEvent = Number.isInteger(eventId) && Boolean(token);
  const canRegister = event ? !event.canceled && event.registrationState !== 'registered' : false;
  const canCancel = event ? !event.canceled && event.registrationState === 'registered' : false;

  const registrationStatusText = useMemo(() => {
    if (!event) {
      return '';
    }

    return event.canceled ? 'Event canceled' : registrationLabel(event.registrationState);
  }, [event]);

  const loadEvent = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!canLoadEvent) {
        setError('Event id is missing.');
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
        const response = await fetch(apiEndpoint(`/events/${eventId}`), {
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

        const body = (await response.json()) as EventDetailResponse;
        setEvent(body.data);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load event details.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [canLoadEvent, eventId, logout, token],
  );

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const updateRegistration = useCallback(
    async (action: 'register' | 'cancel-registration') => {
      if (!event || !token) {
        return;
      }

      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(apiEndpoint(`/events/${event.id}/${action}`), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
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

        setSuccessMessage(action === 'register' ? 'Registration confirmed.' : 'Registration canceled.');
        await loadEvent('refresh');
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to update registration.');
      } finally {
        setIsSaving(false);
      }
    },
    [event, loadEvent, logout, token],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0a66c2" size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Event details are unavailable.'}</Text>
        <Pressable style={styles.primaryButton} onPress={() => loadEvent()}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadEvent('refresh')} />}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>Event Details</Text>
            <Text style={styles.title}>{event.title}</Text>
          </View>
          <Text style={[styles.statusBadge, event.canceled && styles.canceledBadge]}>
            {event.canceled ? 'Canceled' : event.eventType}
          </Text>
        </View>

        {event.description ? <Text style={styles.description}>{event.description}</Text> : null}

        <View style={styles.detailGrid}>
          <DetailTile label="Date" value={formatDate(event.eventDate)} />
          <DetailTile label="Time" value={formatTime(event.eventDate)} />
          <DetailTile label="Venue" value={event.venue.name} />
          <DetailTile label="City" value={event.venue.city} />
          <DetailTile label="Capacity" value={event.capacity ?? 'No limit'} />
          <DetailTile label="Status" value={event.canceled ? 'Canceled' : 'Open'} />
        </View>

        <View style={styles.venueBlock}>
          <Text style={styles.sectionLabel}>Venue Address</Text>
          <Text style={styles.address}>{event.venue.address}</Text>
        </View>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registration</Text>
        <Text
          style={[
            styles.registrationBadge,
            event.registrationState === 'registered' && styles.registrationRegistered,
            event.registrationState === 'waitlisted' && styles.registrationWaitlisted,
            event.canceled && styles.registrationCanceled,
          ]}
        >
          {registrationStatusText}
        </Text>

        <View style={styles.actionRow}>
          {canRegister ? (
            <Pressable
              disabled={isSaving}
              onPress={() => updateRegistration('register')}
              style={[styles.primaryButton, isSaving && styles.disabledButton]}
            >
              <Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : 'Register'}</Text>
            </Pressable>
          ) : null}

          {canCancel ? (
            <Pressable
              disabled={isSaving}
              onPress={() => updateRegistration('cancel-registration')}
              style={[styles.secondaryButton, isSaving && styles.disabledButton]}
            >
              <Text style={styles.secondaryButtonText}>{isSaving ? 'Saving...' : 'Cancel Registration'}</Text>
            </Pressable>
          ) : null}
        </View>

        {!canRegister && !canCancel ? (
          <Text style={styles.helperText}>
            {event.canceled ? 'Registration is closed because this event is canceled.' : 'No registration action is available.'}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registrations</Text>
        {event.registrations.length ? (
          <View style={styles.registrationList}>
            {event.registrations.map((registration) => (
              <View key={registration.id} style={styles.registrationRow}>
                <View style={styles.registrationInfo}>
                  <Text style={styles.registrationName}>{registration.playerName ?? registration.userName}</Text>
                  <Text style={styles.registrationMeta}>
                    {registration.playerName ? `Parent: ${registration.userName}` : 'Direct registration'}
                  </Text>
                  <Text style={styles.registrationMeta}>{formatRegistrationDate(registration.registeredAt)}</Text>
                </View>
                <Text
                  style={[
                    styles.smallStatusBadge,
                    registration.status === 'registered' && styles.registrationRegistered,
                    registration.status === 'waitlisted' && styles.registrationWaitlisted,
                    registration.status === 'canceled' && styles.registrationCanceled,
                  ]}
                >
                  {registrationLabel(registration.status)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.helperText}>No registrations yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f8',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
    backgroundColor: '#fff',
  },
  hero: {
    backgroundColor: '#fff',
    borderColor: '#e4e4e7',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#0a66c2',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#18181b',
    fontSize: 26,
    fontWeight: '800',
  },
  description: {
    color: '#3f3f46',
    fontSize: 15,
    lineHeight: 22,
  },
  statusBadge: {
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
  canceledBadge: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailTile: {
    minWidth: 145,
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    padding: 12,
    gap: 4,
  },
  detailLabel: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: '800',
  },
  venueBlock: {
    borderRadius: 8,
    backgroundColor: '#f7f7f8',
    padding: 12,
    gap: 4,
  },
  sectionLabel: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  address: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fff',
    borderColor: '#e4e4e7',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    color: '#18181b',
    fontSize: 20,
    fontWeight: '800',
  },
  registrationBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#f4f4f5',
    color: '#52525b',
    fontSize: 13,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#0a66c2',
    minWidth: 160,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#b91c1c',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 180,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.65,
  },
  registrationList: {
    gap: 10,
  },
  registrationRow: {
    alignItems: 'flex-start',
    borderBottomColor: '#f4f4f5',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  registrationInfo: {
    flex: 1,
    gap: 3,
  },
  registrationName: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: '800',
  },
  registrationMeta: {
    color: '#71717a',
    fontSize: 13,
  },
  smallStatusBadge: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  helperText: {
    color: '#71717a',
    fontSize: 14,
    lineHeight: 20,
  },
  inlineError: {
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    fontSize: 14,
    padding: 12,
  },
  successText: {
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: 14,
    fontWeight: '700',
    padding: 12,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 15,
    textAlign: 'center',
  },
});
