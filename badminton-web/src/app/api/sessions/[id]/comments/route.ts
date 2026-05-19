import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { db, sessionComments, users } from "@/db";
import { canManageSession, getSessionGroupForUser } from "@/lib/session-data";

function readCommentText(value: unknown) {
  return String(value ?? "")
    .trim()
    .slice(0, 1000);
}

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

  const session = await getSessionGroupForUser(sessionId, auth.user);

  if (!session) {
    return jsonError("You are not a member of this session group.", 403);
  }

  const canManageComments = await canManageSession(sessionId, auth.user);
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
    .orderBy(desc(sessionComments.commentedAt));

  return Response.json({
    data: comments.map((comment) => ({
      ...comment,
      canEdit: comment.userId === auth.user.id || canManageComments,
    })),
  });
}

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
  const text = readCommentText(body?.text);

  if (!Number.isInteger(sessionId)) {
    return jsonError("Session id must be a number.", 400);
  }

  if (!text) {
    return jsonError("Comment text is required.", 400);
  }

  const session = await getSessionGroupForUser(sessionId, auth.user);

  if (!session) {
    return jsonError("You are not a member of this session group.", 403);
  }

  const [comment] = await db
    .insert(sessionComments)
    .values({
      sessionId,
      userId: auth.user.id,
      text,
      commentedAt: new Date(),
    })
    .returning({
      id: sessionComments.id,
      userId: sessionComments.userId,
      text: sessionComments.text,
      commentedAt: sessionComments.commentedAt,
    });

  return Response.json(
    {
      data: {
        ...comment,
        authorName: auth.user.name,
        canEdit: true,
      },
    },
    { status: 201 },
  );
}
