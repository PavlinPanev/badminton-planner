import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { db, sessionComments } from "@/db";
import { canManageSession, getSessionGroupForUser } from "@/lib/session-data";

function readCommentText(value: unknown) {
  return String(value ?? "")
    .trim()
    .slice(0, 1000);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id, commentId: rawCommentId } = await params;
  const sessionId = Number(id);
  const commentId = Number(rawCommentId);
  const body = await request.json().catch(() => null);
  const text = readCommentText(body?.text);

  if (!Number.isInteger(sessionId) || !Number.isInteger(commentId)) {
    return jsonError("Session id and comment id must be numbers.", 400);
  }

  if (!text) {
    return jsonError("Comment text is required.", 400);
  }

  const session = await getSessionGroupForUser(sessionId, auth.user);

  if (!session) {
    return jsonError("You are not a member of this session group.", 403);
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
    return jsonError("Comment not found.", 404);
  }

  const canEdit = existingComment.userId === auth.user.id || (await canManageSession(sessionId, auth.user));

  if (!canEdit) {
    return jsonError("You can only edit comments you own or manage.", 403);
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

  return Response.json({
    data: {
      ...comment,
      authorName: existingComment.userId === auth.user.id ? auth.user.name : undefined,
      canEdit: true,
    },
  });
}
