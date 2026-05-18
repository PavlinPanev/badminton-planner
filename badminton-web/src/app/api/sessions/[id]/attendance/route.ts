import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { db, sessionAttendance } from "@/db";
import { getAttendanceTargetsForUser, getSessionGroupForUser } from "@/lib/session-data";
import { getSessionState } from "@/lib/session-status";

type AttendanceStatus = "attending" | "absent" | "maybe";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const sessionId = Number(id);
  const body = await request.json().catch(() => null);
  const playerId = Number(body?.playerId);
  const status = String(body?.status ?? "") as AttendanceStatus;
  const note = String(body?.note ?? "").trim().slice(0, 240);

  if (!Number.isInteger(sessionId)) {
    return jsonError("Session id must be a number.", 400);
  }

  if (!Number.isInteger(playerId)) {
    return jsonError("playerId is required.", 400);
  }

  if (!["attending", "absent", "maybe"].includes(status)) {
    return jsonError("status must be attending, absent, or maybe.", 400);
  }

  const session = await getSessionGroupForUser(sessionId, auth.user);

  if (!session) {
    return jsonError("You are not a member of this session group.", 403);
  }

  const sessionState = getSessionState(session.sessionDate, session.startTime);

  if (session.canceled || (sessionState !== "upcoming" && sessionState !== "current")) {
    return jsonError("Attendance is closed for this session.", 409);
  }

  const targets = await getAttendanceTargetsForUser(sessionId, auth.user);

  if (!targets.some((target) => target.id === playerId)) {
    return jsonError("You can only update attendance for your linked players.", 403);
  }

  const [attendance] = await db
    .insert(sessionAttendance)
    .values({
      sessionId,
      playerId,
      parentUserId: auth.user.id,
      status,
      note: note || null,
      markedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [sessionAttendance.sessionId, sessionAttendance.playerId],
      set: {
        parentUserId: auth.user.id,
        status,
        note: note || null,
        markedAt: new Date(),
      },
    })
    .returning();

  return Response.json({
    data: {
      id: attendance.id,
      sessionId: attendance.sessionId,
      playerId: attendance.playerId,
      status: attendance.status,
      note: attendance.note,
      markedAt: attendance.markedAt,
    },
  });
}
