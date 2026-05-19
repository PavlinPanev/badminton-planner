import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import type { AuthUser } from "@/auth/token";
import { paginationMeta } from "@/auth/api";
import { db, sessionAttendance, sessionComments, users } from "@/db";
import {
  canManageSession,
  getAttendanceTargetsForUser,
  getDashboardSessions,
  getSessionDetailForUser,
  getSessionGroupForUser,
} from "@/lib/session-data";
import { formatSessionDate, formatSessionTime, getSessionState } from "@/lib/session-status";

export async function getSessionsList(user: AuthUser, options: { page: number; pageSize: number }) {
  const { activeSessions, paging } = await getDashboardSessions(user, {
    activePage: options.page,
    archivePage: 1,
    pageSize: options.pageSize,
  });
  const activePaging = paging?.active ?? {
    page: options.page,
    pageSize: options.pageSize,
    total: activeSessions.length,
    totalPages: Math.max(Math.ceil(activeSessions.length / options.pageSize), 1),
  };

  return {
    data: activeSessions.map((session) => ({
      id: session.id,
      group: { id: session.groupId, title: session.groupTitle },
      venue: { name: session.venueName },
      date: session.sessionDate,
      formattedDate: formatSessionDate(session.sessionDate),
      time: formatSessionTime(session.startTime),
      state: session.state,
      canceled: session.canceled,
      capacity: session.capacity,
      capacityState: session.capacityState,
      attendanceSummary: session.attendanceSummary,
      commentsCount: session.commentsCount,
    })),
    paging: paginationMeta(activePaging.page, activePaging.pageSize, activePaging.total),
  };
}

export async function getSessionDetail(user: AuthUser, sessionId: number) {
  const result = await getSessionDetailForUser(sessionId, user);

  if (result.status === "not-found") {
    return { status: "not-found" as const };
  }

  if (result.status === "forbidden") {
    return { status: "forbidden" as const };
  }

  const session = result.session;
  const canManageComments = await canManageSession(session.id, user);

  return {
    status: "ok" as const,
    data: {
      id: session.id,
      date: session.sessionDate,
      time: session.startTime,
      venue: { name: session.venueName },
      group: { id: session.groupId, title: session.groupTitle },
      coach: { name: session.coachName },
      state: session.state,
      active: session.active,
      canceled: session.canceled,
      capacity: session.capacity,
      capacityState: session.capacityState,
      attendanceSummary: session.attendanceSummary,
      attendance: session.members.map((member) => ({
        memberId: member.id,
        playerId: member.playerId,
        userId: member.userId,
        name: member.name,
        role: member.role,
        status: member.attendance,
        note: member.note,
      })),
      comments: session.comments.map((comment) => ({
        id: comment.id,
        userId: comment.userId,
        text: comment.text,
        authorName: comment.authorName,
        commentedAt: comment.commentedAt,
        canEdit: comment.userId === user.id || canManageComments,
      })),
    },
  };
}

export async function listSessionComments(user: AuthUser, sessionId: number, options: { page: number; pageSize: number }) {
  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return { status: "forbidden" as const };
  }

  const canManageComments = await canManageSession(sessionId, user);
  const [{ total: totalCount }] = await db
    .select({ total: count() })
    .from(sessionComments)
    .where(eq(sessionComments.sessionId, sessionId));
  const comments = await db
    .select({
      id: sessionComments.id,
      userId: sessionComments.userId,
      text: sessionComments.text,
      commentedAt: sessionComments.commentedAt,
      authorName: users.name,
    })
    .from(sessionComments)
    .innerJoin(users, eq(sessionComments.userId, users.id))
    .where(eq(sessionComments.sessionId, sessionId))
    .orderBy(desc(sessionComments.commentedAt), desc(sessionComments.id))
    .limit(options.pageSize)
    .offset((options.page - 1) * options.pageSize);

  return {
    status: "ok" as const,
    data: comments.map((comment) => ({
      ...comment,
      canEdit: comment.userId === user.id || canManageComments,
    })),
    paging: paginationMeta(options.page, options.pageSize, totalCount),
  };
}

export async function createSessionComment(user: AuthUser, sessionId: number, text: string) {
  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return { status: "forbidden" as const };
  }

  const [comment] = await db
    .insert(sessionComments)
    .values({
      sessionId,
      userId: user.id,
      text,
      commentedAt: new Date(),
    })
    .returning({
      id: sessionComments.id,
      userId: sessionComments.userId,
      text: sessionComments.text,
      commentedAt: sessionComments.commentedAt,
    });

  return {
    status: "ok" as const,
    data: {
      ...comment,
      authorName: user.name,
      canEdit: true,
    },
  };
}

export async function updateSessionComment(user: AuthUser, sessionId: number, commentId: number, text: string) {
  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return { status: "forbidden" as const };
  }

  const [existingComment] = await db
    .select({
      id: sessionComments.id,
      userId: sessionComments.userId,
    })
    .from(sessionComments)
    .where(and(eq(sessionComments.id, commentId), eq(sessionComments.sessionId, sessionId)))
    .limit(1);

  if (!existingComment) {
    return { status: "not-found" as const };
  }

  const canEdit = existingComment.userId === user.id || (await canManageSession(sessionId, user));

  if (!canEdit) {
    return { status: "forbidden-edit" as const };
  }

  const [comment] = await db
    .update(sessionComments)
    .set({ text })
    .where(and(eq(sessionComments.id, commentId), eq(sessionComments.sessionId, sessionId)))
    .returning({
      id: sessionComments.id,
      userId: sessionComments.userId,
      text: sessionComments.text,
      commentedAt: sessionComments.commentedAt,
    });

  return {
    status: "ok" as const,
    data: {
      ...comment,
      authorName: existingComment.userId === user.id ? user.name : undefined,
      canEdit: true,
    },
  };
}

export async function updateAttendance(
  user: AuthUser,
  sessionId: number,
  playerId: number,
  status: "attending" | "absent" | "maybe",
  note: string,
) {
  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return { status: "forbidden" as const };
  }

  const sessionState = getSessionState(session.sessionDate, session.startTime);

  if (session.canceled || (sessionState !== "upcoming" && sessionState !== "current")) {
    return { status: "closed" as const };
  }

  const targets = await getAttendanceTargetsForUser(sessionId, user);

  if (!targets.some((target) => target.id === playerId)) {
    return { status: "forbidden-player" as const };
  }

  const [attendance] = await db
    .insert(sessionAttendance)
    .values({
      sessionId,
      playerId,
      parentUserId: user.id,
      status,
      note: note || null,
      markedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [sessionAttendance.sessionId, sessionAttendance.playerId],
      set: {
        parentUserId: user.id,
        status,
        note: note || null,
        markedAt: new Date(),
      },
    })
    .returning();

  return {
    status: "ok" as const,
    data: {
      id: attendance.id,
      sessionId: attendance.sessionId,
      playerId: attendance.playerId,
      status: attendance.status,
      note: attendance.note,
      markedAt: attendance.markedAt,
    },
  };
}
