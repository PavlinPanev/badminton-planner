import { and, eq, isNull } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { db, eventRegistrations, events, players } from "@/db";

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

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  if (!event) {
    return jsonError("Event not found.", 404);
  }

  if (event.canceled) {
    return jsonError("Event is canceled.", 409);
  }

  if (playerId !== null) {
    const [player] = await db
      .select({ id: players.id })
      .from(players)
      .where(and(eq(players.id, playerId), eq(players.parentUserId, auth.user.id)))
      .limit(1);

    if (!player) {
      return jsonError("You can only register your linked players.", 403);
    }
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

  const [existing] = await db.select().from(eventRegistrations).where(existingWhere).limit(1);

  const [registration] = existing
    ? await db
        .update(eventRegistrations)
        .set({ status: "registered", registeredAt: new Date() })
        .where(eq(eventRegistrations.id, existing.id))
        .returning()
    : await db
        .insert(eventRegistrations)
        .values({
          eventId,
          userId: auth.user.id,
          playerId,
          status: "registered",
          registeredAt: new Date(),
        })
        .returning();

  return Response.json({ data: registration });
}
