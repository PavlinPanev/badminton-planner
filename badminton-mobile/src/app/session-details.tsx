import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { ApiError, apiEndpoint, readApiError } from '@/lib/api';

type AttendanceStatus = 'attending' | 'absent' | 'maybe' | 'no response';
type AttendanceUpdateStatus = Exclude<AttendanceStatus, 'no response'>;

type AttendanceSummary = Record<AttendanceStatus, number>;

type SessionAttendance = {
  memberId: string;
  playerId: number | null;
  userId: number | null;
  name: string;
  role: string;
  status: AttendanceStatus;
  note: string | null;
};

type SessionComment = {
  id: number;
  text: string;
  authorName: string;
  commentedAt: string;
};

type SessionDetail = {
  id: number;
  date: string;
  time: string;
  venue: {
    name: string;
  };
  group: {
    id: number;
    title: string;
  };
  coach: {
    name: string | null;
  };
  state: string;
  active: boolean;
  canceled: boolean;
  capacity: number | null;
  capacityState: string;
  attendanceSummary: AttendanceSummary;
  attendance: SessionAttendance[];
  comments: SessionComment[];
};

type SessionDetailResponse = {
  data: SessionDetail;
};

const statusOptions: { label: string; value: AttendanceUpdateStatus }[] = [
  { label: 'Attending', value: 'attending' },
  { label: 'Not Attending', value: 'absent' },
  { label: 'Maybe', value: 'maybe' },
];

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':');
  return [hours, minutes].filter(Boolean).join(':') || value;
}

function formatCommentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusLabel(status: AttendanceStatus) {
  if (status === 'absent') {
    return 'Not attending';
  }

  if (status === 'no response') {
    return 'No response';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function SummaryTile({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return (
    <Text style={[styles.attendanceBadge, styles[`attendance_${status.replace(' ', '_')}`]]}>
      {statusLabel(status)}
    </Text>
  );
}

export default function SessionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token, user, logout } = useAuth();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingPlayerId, setSavingPlayerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sessionId = Number(id);
  const canLoadSession = Number.isInteger(sessionId) && Boolean(token);

  const editableAttendance = useMemo(
    () =>
      user?.role === 'parent'
        ? session?.attendance.filter((record) => record.playerId !== null && record.userId !== user.id) ?? []
        : [],
    [session?.attendance, user?.id, user?.role],
  );

  const loadSession = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!canLoadSession) {
        setError('Session id is missing.');
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
        const response = await fetch(apiEndpoint(`/sessions/${sessionId}`), {
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

        const body = (await response.json()) as SessionDetailResponse;
        setSession(body.data);
        setNotes(
          body.data.attendance.reduce<Record<number, string>>((drafts, record) => {
            if (record.playerId !== null) {
              drafts[record.playerId] = record.note ?? '';
            }
            return drafts;
          }, {}),
        );
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load session details.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [canLoadSession, logout, sessionId, token],
  );

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const updateAttendance = useCallback(
    async (playerId: number, status: AttendanceUpdateStatus) => {
      if (!token || !session) {
        return;
      }

      setSavingPlayerId(playerId);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(apiEndpoint(`/sessions/${session.id}/attendance`), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playerId,
            status,
            note: notes[playerId] ?? '',
          }),
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

        setSuccessMessage('Attendance updated.');
        await loadSession('refresh');
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to update attendance.');
      } finally {
        setSavingPlayerId(null);
      }
    },
    [loadSession, logout, notes, session, token],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#0a66c2" size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Session details are unavailable.'}</Text>
        <Pressable style={styles.primaryButton} onPress={() => loadSession()}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadSession('refresh')} />}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTitleBlock}>
            <Text style={styles.eyebrow}>Session Details</Text>
            <Text style={styles.title}>{session.group.title}</Text>
          </View>
          <Text style={[styles.stateBadge, session.canceled && styles.canceledBadge]}>
            {session.canceled ? 'Canceled' : session.state}
          </Text>
        </View>

        <View style={styles.detailGrid}>
          <SummaryTile label="Date" value={formatDate(session.date)} />
          <SummaryTile label="Time" value={formatTime(session.time)} />
          <SummaryTile label="Venue" value={session.venue.name} />
          <SummaryTile label="Coach" value={session.coach.name ?? 'Not assigned'} />
          <SummaryTile label="Capacity" value={session.capacity ?? 'No limit'} />
          <SummaryTile label="Capacity state" value={session.capacityState} />
        </View>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Summary</Text>
        <View style={styles.summaryGrid}>
          <SummaryTile label="Attending" value={session.attendanceSummary.attending} />
          <SummaryTile label="Not attending" value={session.attendanceSummary.absent} />
          <SummaryTile label="Maybe" value={session.attendanceSummary.maybe} />
          <SummaryTile label="No response" value={session.attendanceSummary['no response']} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Attendance</Text>
        {session.active && editableAttendance.length ? (
          editableAttendance.map((record) => {
            const playerId = record.playerId;

            if (playerId === null) {
              return null;
            }

            const isSaving = savingPlayerId === playerId;

            return (
              <View key={record.memberId} style={styles.attendanceForm}>
                <View style={styles.attendanceFormHeader}>
                  <View>
                    <Text style={styles.memberName}>{record.name}</Text>
                    <Text style={styles.memberRole}>{record.role}</Text>
                  </View>
                  <AttendanceBadge status={record.status} />
                </View>

                <TextInput
                  editable={!isSaving}
                  multiline
                  onChangeText={(value) => setNotes((current) => ({ ...current, [playerId]: value }))}
                  placeholder="Optional attendance note"
                  style={styles.noteInput}
                  value={notes[playerId] ?? ''}
                />

                <View style={styles.statusButtons}>
                  {statusOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      disabled={isSaving}
                      onPress={() => updateAttendance(playerId, option.value)}
                      style={[
                        styles.statusButton,
                        record.status === option.value && styles.statusButtonActive,
                        isSaving && styles.disabledButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          record.status === option.value && styles.statusButtonTextActive,
                        ]}
                      >
                        {isSaving ? 'Saving...' : option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            {session.active
              ? 'No linked player attendance target is available for this account.'
              : 'Attendance is closed for this session.'}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance</Text>
        <View style={styles.memberList}>
          {session.attendance.map((record) => (
            <View key={record.memberId} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{record.name}</Text>
                <Text style={styles.memberRole}>{record.role}</Text>
                {record.note ? <Text style={styles.memberNote}>{record.note}</Text> : null}
              </View>
              <AttendanceBadge status={record.status} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comments and Coach Notes</Text>
        {session.comments.length ? (
          <View style={styles.commentList}>
            {session.comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                  <Text style={styles.commentDate}>{formatCommentDate(comment.commentedAt)}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No coach notes or parent comments have been added.</Text>
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
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  heroTitleBlock: {
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
  stateBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
    color: '#047857',
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    minWidth: 145,
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    padding: 12,
    gap: 4,
  },
  summaryLabel: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: '800',
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
  attendanceForm: {
    borderColor: '#e4e4e7',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  attendanceFormHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  noteInput: {
    minHeight: 78,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    borderWidth: 1,
    color: '#18181b',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexGrow: 1,
    alignItems: 'center',
    borderColor: '#0a66c2',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusButtonActive: {
    backgroundColor: '#0a66c2',
  },
  disabledButton: {
    opacity: 0.65,
  },
  statusButtonText: {
    color: '#0a66c2',
    fontSize: 14,
    fontWeight: '800',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  memberList: {
    gap: 10,
  },
  memberRow: {
    alignItems: 'flex-start',
    borderBottomColor: '#f4f4f5',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  memberInfo: {
    flex: 1,
    gap: 3,
  },
  memberName: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: '800',
  },
  memberRole: {
    color: '#71717a',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  memberNote: {
    color: '#3f3f46',
    fontSize: 13,
    marginTop: 4,
  },
  attendanceBadge: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attendance_attending: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
  },
  attendance_absent: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  attendance_maybe: {
    backgroundColor: '#fffbeb',
    color: '#a16207',
  },
  attendance_no_response: {
    backgroundColor: '#f4f4f5',
    color: '#52525b',
  },
  commentList: {
    gap: 10,
  },
  commentCard: {
    borderColor: '#e4e4e7',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  commentHeader: {
    gap: 2,
  },
  commentAuthor: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '800',
  },
  commentDate: {
    color: '#71717a',
    fontSize: 12,
  },
  commentText: {
    color: '#3f3f46',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
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
  primaryButton: {
    borderRadius: 8,
    backgroundColor: '#0a66c2',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
