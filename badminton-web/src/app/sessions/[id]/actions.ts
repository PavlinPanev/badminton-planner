"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, sessionAttendance, sessions } from "@/db";
import { canCancelSession, getAttendanceTargetsForUser, getSessionGroupForUser } from "@/lib/session-data";
import { getSessionState } from "@/lib/session-status";

export type AttendanceActionState = {
  error?: string;
  success?: string;
};

type MarkedAttendanceStatus = "attending" | "absent" | "maybe";

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
