import { and, asc, eq, inArray } from "drizzle-orm";

import {
  db,
  groupMembers,
  groups,
  players,
  sessionAttendance,
  sessionComments,
  sessions,
  users,
  venues,
} from "@/db";
import type { AuthUser } from "@/auth/token";
import {
  AttendanceStatus,
  getCapacityState,
  getSessionState,
  SessionState,
} from "./session-status";

type SessionRow = {
  id: number;
  sessionDate: string;
  startTime: string;
  capacity: number | null;
  canceled: boolean;
  groupId: number;
  groupTitle: string;
  venueName: string;
};

export type SessionCardData = SessionRow & {
  state: SessionState;
  active: boolean;
  capacityState: ReturnType<typeof getCapacityState>;
  attendanceSummary: Record<AttendanceStatus, number>;
  commentsCount: number;
  memberCount: number;
};

export type SessionMemberData = {
  id: string;
  name: string;
  role: string;
  attendance: AttendanceStatus;
  note: string | null;
};

export type SessionDetailData = SessionCardData & {
  members: SessionMemberData[];
};

async function getAccessibleGroupIds(user: AuthUser) {
  if (user.role === "admin") {
    const allGroups = await db.select({ id: groups.id }).from(groups);
    return allGroups.map((group) => group.id);
  }

  const ownedPlayers = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.parentUserId, user.id));
  const ownedPlayerIds = ownedPlayers.map((player) => player.id);

  const directMemberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id));

  const playerMemberships = ownedPlayerIds.length
    ? await db
        .select({ groupId: groupMembers.groupId })
        .from(groupMembers)
        .where(inArray(groupMembers.playerId, ownedPlayerIds))
    : [];

  return Array.from(
    new Set([...directMemberships, ...playerMemberships].map((membership) => membership.groupId)),
  );
}

async function getSessionRowsForUser(user: AuthUser) {
  const groupIds = await getAccessibleGroupIds(user);

  if (!groupIds.length) {
    return [];
  }

  return db
    .select({
      id: sessions.id,
      sessionDate: sessions.sessionDate,
      startTime: sessions.startTime,
      capacity: sessions.capacity,
      canceled: sessions.canceled,
      groupId: groups.id,
      groupTitle: groups.title,
      venueName: venues.name,
    })
    .from(sessions)
    .innerJoin(groups, eq(sessions.groupId, groups.id))
    .innerJoin(venues, eq(sessions.venueId, venues.id))
    .where(inArray(sessions.groupId, groupIds))
    .orderBy(asc(sessions.sessionDate), asc(sessions.startTime));
}

async function getSessionMembers(groupId: number): Promise<SessionMemberData[]> {
  const rows = await db
    .select({
      memberId: groupMembers.id,
      role: groupMembers.role,
      userName: users.name,
      playerName: players.name,
      playerId: players.id,
    })
    .from(groupMembers)
    .leftJoin(users, eq(groupMembers.userId, users.id))
    .leftJoin(players, eq(groupMembers.playerId, players.id))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(asc(groupMembers.role), asc(players.name), asc(users.name));

  return rows.map((row) => ({
    id: row.playerId ? `player-${row.playerId}` : `member-${row.memberId}`,
    name: row.playerName ?? row.userName ?? "Unknown member",
    role: row.role,
    attendance: "no response",
    note: null,
  }));
}

async function enrichSession(row: SessionRow): Promise<SessionCardData> {
  const [attendanceRows, commentRows, members] = await Promise.all([
    db
      .select({
        playerId: sessionAttendance.playerId,
        status: sessionAttendance.status,
      })
      .from(sessionAttendance)
      .where(eq(sessionAttendance.sessionId, row.id)),
    db
      .select({ id: sessionComments.id })
      .from(sessionComments)
      .where(eq(sessionComments.sessionId, row.id)),
    getSessionMembers(row.groupId),
  ]);

  const summary: Record<AttendanceStatus, number> = {
    attending: 0,
    absent: 0,
    maybe: 0,
    "no response": 0,
  };

  for (const attendance of attendanceRows) {
    summary[attendance.status]++;
  }

  summary["no response"] = Math.max(members.length - attendanceRows.length, 0);

  const state = getSessionState(row.sessionDate, row.startTime);

  return {
    ...row,
    state,
    active: !row.canceled && (state === "upcoming" || state === "current"),
    capacityState: getCapacityState(summary.attending, row.capacity),
    attendanceSummary: summary,
    commentsCount: commentRows.length,
    memberCount: members.length,
  };
}

export async function getDashboardSessions(user: AuthUser) {
  const rows = await getSessionRowsForUser(user);
  const enriched = await Promise.all(rows.map(enrichSession));

  return {
    activeSessions: enriched.filter((session) => session.active),
    archiveSessions: enriched.filter((session) => !session.active),
  };
}

export async function getSessionDetailForUser(sessionId: number, user: AuthUser) {
  const groupIds = await getAccessibleGroupIds(user);

  if (!groupIds.length) {
    return null;
  }

  const [row] = await db
    .select({
      id: sessions.id,
      sessionDate: sessions.sessionDate,
      startTime: sessions.startTime,
      capacity: sessions.capacity,
      canceled: sessions.canceled,
      groupId: groups.id,
      groupTitle: groups.title,
      venueName: venues.name,
    })
    .from(sessions)
    .innerJoin(groups, eq(sessions.groupId, groups.id))
    .innerJoin(venues, eq(sessions.venueId, venues.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row || !groupIds.includes(row.groupId)) {
    return null;
  }

  const [card, members, attendanceRows] = await Promise.all([
    enrichSession(row),
    getSessionMembers(row.groupId),
    db
      .select({
        playerId: sessionAttendance.playerId,
        status: sessionAttendance.status,
        note: sessionAttendance.note,
      })
      .from(sessionAttendance)
      .where(eq(sessionAttendance.sessionId, row.id)),
  ]);

  const attendanceByPlayerId = new Map(attendanceRows.map((attendance) => [attendance.playerId, attendance]));
  const detailMembers: SessionMemberData[] = members.map((member) => {
    if (!member.id.startsWith("player-")) {
      return member;
    }

    const playerId = Number(member.id.replace("player-", ""));
    const attendance = attendanceByPlayerId.get(playerId);

    return {
      ...member,
      attendance: attendance?.status ?? "no response",
      note: attendance?.note ?? null,
    };
  });

  return {
    ...card,
    members: detailMembers,
  };
}

export async function canCancelSession(sessionId: number, user: AuthUser) {
  if (user.role === "admin") {
    return true;
  }

  const [session] = await db
    .select({
      groupId: sessions.groupId,
      coachUserId: sessions.coachUserId,
    })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) {
    return false;
  }

  if (session.coachUserId === user.id) {
    return true;
  }

  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, session.groupId), eq(groupMembers.userId, user.id)))
    .limit(1);

  return membership?.role === "coach" || membership?.role === "manager";
}
