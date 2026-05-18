import { and, eq, isNull } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { db, eventRegistrations } from "@/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const eventId = Number(id);
  const body = await request.json().catch(() => ({}));
  const playerId = body?.playerId === undefined || body?.playerId === null ? null : Number(body.playerId);

  if (!Number.isInteger(eventId)) {
    return jsonError("Event id must be a number.", 400);
  }

  if (playerId !== null && !Number.isInteger(playerId)) {
    return jsonError("playerId must be a number when provided.", 400);
  }

  const existingWhere =
    playerId === null
      ? and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, auth.user.id),
          isNull(eventRegistrations.playerId),
        )
      : and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, auth.user.id),
          eq(eventRegistrations.playerId, playerId),
        );

  const [registration] = await db
    .update(eventRegistrations)
    .set({ status: "canceled" })
    .where(existingWhere)
    .returning();

  if (!registration) {
    return jsonError("Registration not found.", 404);
  }

  return Response.json({ data: registration });
}
