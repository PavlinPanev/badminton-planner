import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { canManageSession, getSessionDetailForUser } from "@/lib/session-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const sessionId = Number(id);

  if (!Number.isInteger(sessionId)) {
    return jsonError("Session id must be a number.", 400);
  }

  const result = await getSessionDetailForUser(sessionId, auth.user);

  if (result.status === "not-found") {
    return jsonError("Session not found.", 404);
  }

  if (result.status === "forbidden") {
    return jsonError("You are not a member of this session group.", 403);
  }

  const session = result.session;
  const canManageComments = await canManageSession(session.id, auth.user);

  return Response.json({
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
        canEdit: comment.userId === auth.user.id || canManageComments,
      })),
    },
  });
}
