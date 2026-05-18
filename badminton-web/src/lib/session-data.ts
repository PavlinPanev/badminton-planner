import { and, asc, desc, eq, inArray } from "drizzle-orm";

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
  coachName: string | null;
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
  playerId: number | null;
  parentUserId: number | null;
  userId: number | null;
  name: string;
  role: string;
  attendance: AttendanceStatus;
  note: string | null;
};

export type SessionDetailData = SessionCardData & {
  members: SessionMemberData[];
  comments: {
    id: number;
    text: string;
    commentedAt: Date;
    authorName: string;
  }[];
  canViewAllAttendance: boolean;
  manageable: boolean;
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
      coachName: users.name,
    })
    .from(sessions)
    .innerJoin(groups, eq(sessions.groupId, groups.id))
    .innerJoin(venues, eq(sessions.venueId, venues.id))
    .leftJoin(users, eq(sessions.coachUserId, users.id))
    .where(inArray(sessions.groupId, groupIds))
    .orderBy(asc(sessions.sessionDate), asc(sessions.startTime));
}

async function getSessionMembers(groupId: number): Promise<SessionMemberData[]> {
  const rows = await db
    .select({
      memberId: groupMembers.id,
      role: groupMembers.role,
      userName: users.name,
      userId: users.id,
      playerName: players.name,
      playerId: players.id,
      parentUserId: players.parentUserId,
    })
    .from(groupMembers)
    .leftJoin(users, eq(groupMembers.userId, users.id))
    .leftJoin(players, eq(groupMembers.playerId, players.id))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(asc(groupMembers.role), asc(players.name), asc(users.name));

  return rows.map((row) => ({
    id: row.playerId ? `player-${row.playerId}` : `member-${row.memberId}`,
    playerId: row.playerId,
    parentUserId: row.parentUserId,
    userId: row.userId,
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
    return { status: "forbidden" as const, session: null };
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
      coachName: users.name,
    })
    .from(sessions)
    .innerJoin(groups, eq(sessions.groupId, groups.id))
    .innerJoin(venues, eq(sessions.venueId, venues.id))
    .leftJoin(users, eq(sessions.coachUserId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) {
    return { status: "not-found" as const, session: null };
  }

  if (!groupIds.includes(row.groupId)) {
    return { status: "forbidden" as const, session: null };
  }

  const canViewAllAttendance = await canManageSession(sessionId, user);
  const [card, members, attendanceRows, commentRows] = await Promise.all([
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
    db
      .select({
        id: sessionComments.id,
        text: sessionComments.text,
        commentedAt: sessionComments.commentedAt,
        authorName: users.name,
      })
      .from(sessionComments)
      .innerJoin(users, eq(sessionComments.userId, users.id))
      .where(eq(sessionComments.sessionId, row.id))
      .orderBy(desc(sessionComments.commentedAt)),
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

  const visibleMembers = canViewAllAttendance
    ? detailMembers
    : detailMembers.filter((member) => member.userId === user.id || member.parentUserId === user.id);

  return {
    status: "ok" as const,
    session: {
      ...card,
      members: visibleMembers,
      comments: commentRows,
      canViewAllAttendance,
      manageable: canViewAllAttendance,
    },
  };
}

export async function canManageSession(sessionId: number, user: AuthUser) {
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

export const canCancelSession = canManageSession;

export async function getSessionGroupForUser(sessionId: number, user: AuthUser) {
  const [session] = await db
    .select({
      id: sessions.id,
      groupId: sessions.groupId,
      sessionDate: sessions.sessionDate,
      startTime: sessions.startTime,
      canceled: sessions.canceled,
    })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) {
    return null;
  }

  const groupIds = await getAccessibleGroupIds(user);

  if (!groupIds.includes(session.groupId)) {
    return null;
  }

  return session;
}

export async function getAttendanceTargetsForUser(sessionId: number, user: AuthUser) {
  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return [];
  }

  const ownedPlayers = await db
    .select({
      id: players.id,
      name: players.name,
    })
    .from(players)
    .innerJoin(groupMembers, eq(groupMembers.playerId, players.id))
    .where(and(eq(players.parentUserId, user.id), eq(groupMembers.groupId, session.groupId)));

  return ownedPlayers;
}
