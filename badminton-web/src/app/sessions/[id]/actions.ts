"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AuthUser } from "@/auth/token";
import { getCurrentUser } from "@/auth/session";
import { db, sessionAttendance, sessionComments, sessions } from "@/db";
import {
  canCancelSession,
  canManageSession,
  getAttendanceTargetsForUser,
  getSessionGroupForUser,
} from "@/lib/session-data";
import { getSessionState } from "@/lib/session-status";

export type AttendanceActionState = {
  error?: string;
  success?: string;
};

export type CommentActionState = {
  error?: string;
  success?: string;
};

type MarkedAttendanceStatus = "attending" | "absent" | "maybe";

function getCommentText(formData: FormData) {
  return String(formData.get("text") ?? "")
    .trim()
    .slice(0, 1000);
}

async function canModifyComment(commentId: number, sessionId: number, user: AuthUser) {
  const [comment] = await db
    .select({
      id: sessionComments.id,
      userId: sessionComments.userId,
    })
    .from(sessionComments)
    .where(and(eq(sessionComments.id, commentId), eq(sessionComments.sessionId, sessionId)))
    .limit(1);

  if (!comment) {
    return false;
  }

  if (comment.userId === user.id) {
    return true;
  }

  return canManageSession(sessionId, user);
}

export async function cancelSessionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessionId = Number(formData.get("sessionId"));

  if (!Number.isInteger(sessionId)) {
    return;
  }

  const allowed = await canCancelSession(sessionId, user);

  if (!allowed) {
    return;
  }

  await db
    .update(sessions)
    .set({
      canceled: true,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));

  revalidatePath("/dashboard");
  revalidatePath(`/sessions/${sessionId}`);
}

export async function markAttendanceAction(
  _state: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessionId = Number(formData.get("sessionId"));
  const playerId = Number(formData.get("playerId"));
  const rawStatus = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 240);

  if (!Number.isInteger(sessionId) || !Number.isInteger(playerId)) {
    return { error: "Choose a valid attendance target." };
  }

  if (!["attending", "absent", "maybe"].includes(rawStatus)) {
    return { error: "Choose attending, not attending, or maybe." };
  }

  const status = rawStatus as MarkedAttendanceStatus;

  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return { error: "You are not a member of this session group." };
  }

  const state = getSessionState(session.sessionDate, session.startTime);

  if (session.canceled || (state !== "upcoming" && state !== "current")) {
    return { error: "Attendance is closed for this session." };
  }

  const targets = await getAttendanceTargetsForUser(sessionId, user);

  if (!targets.some((target) => target.id === playerId)) {
    return { error: "You can only update attendance for your linked players." };
  }

  await db
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
    });

  revalidatePath("/dashboard");
  revalidatePath(`/sessions/${sessionId}`);

  return { success: "Attendance updated." };
}

export async function addSessionCommentAction(
  _state: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessionId = Number(formData.get("sessionId"));
  const text = getCommentText(formData);

  if (!Number.isInteger(sessionId)) {
    return { error: "Choose a valid session." };
  }

  if (!text) {
    return { error: "Write a comment before posting." };
  }

  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return { error: "You are not a member of this session group." };
  }

  await db.insert(sessionComments).values({
    sessionId,
    userId: user.id,
    text,
    commentedAt: new Date(),
  });

  revalidatePath("/dashboard");
  revalidatePath(`/sessions/${sessionId}`);

  return { success: "Comment added." };
}

export async function updateSessionCommentAction(
  _state: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessionId = Number(formData.get("sessionId"));
  const commentId = Number(formData.get("commentId"));
  const text = getCommentText(formData);

  if (!Number.isInteger(sessionId) || !Number.isInteger(commentId)) {
    return { error: "Choose a valid comment." };
  }

  if (!text) {
    return { error: "Comment text cannot be empty." };
  }

  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return { error: "You are not a member of this session group." };
  }

  const allowed = await canModifyComment(commentId, sessionId, user);

  if (!allowed) {
    return { error: "You can only edit comments you own or manage." };
  }

  await db
    .update(sessionComments)
    .set({ text })
    .where(and(eq(sessionComments.id, commentId), eq(sessionComments.sessionId, sessionId)));

  revalidatePath(`/sessions/${sessionId}`);

  return { success: "Comment updated." };
}

export async function deleteSessionCommentAction(
  _state: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessionId = Number(formData.get("sessionId"));
  const commentId = Number(formData.get("commentId"));

  if (!Number.isInteger(sessionId) || !Number.isInteger(commentId)) {
    return { error: "Choose a valid comment." };
  }

  const session = await getSessionGroupForUser(sessionId, user);

  if (!session) {
    return { error: "You are not a member of this session group." };
  }

  const allowed = await canModifyComment(commentId, sessionId, user);

  if (!allowed) {
    return { error: "You can only delete comments you own or manage." };
  }

  await db
    .delete(sessionComments)
    .where(and(eq(sessionComments.id, commentId), eq(sessionComments.sessionId, sessionId)));

  revalidatePath("/dashboard");
  revalidatePath(`/sessions/${sessionId}`);

  return { success: "Comment deleted." };
}
