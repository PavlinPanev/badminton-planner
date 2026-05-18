import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { db, eventRegistrations, events, players, users, venues } from "@/db";

type EventRegistrationState = "registered" | "waitlisted" | "canceled" | "not_registered";

function resolveRegistrationState(statuses: string[]): EventRegistrationState {
  if (statuses.includes("registered")) {
    return "registered";
  }

  if (statuses.includes("waitlisted")) {
    return "waitlisted";
  }

  if (statuses.includes("canceled")) {
    return "canceled";
  }

  return "not_registered";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const hasBearerToken = request.headers.get("authorization")?.toLowerCase().startsWith("bearer ");
  const auth = hasBearerToken ? await getApiUser(request) : null;

  if (auth?.error) {
    return auth.error;
  }

  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isInteger(eventId)) {
    return jsonError("Event id must be a number.", 400);
  }

  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
      capacity: events.capacity,
      canceled: events.canceled,
      venueId: venues.id,
      venueName: venues.name,
      venueAddress: venues.address,
      venueCity: venues.city,
    })
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    return jsonError("Event not found.", 404);
  }

  const registrations = await db
    .select({
      id: eventRegistrations.id,
      status: eventRegistrations.status,
      registeredAt: eventRegistrations.registeredAt,
      userId: eventRegistrations.userId,
      userName: users.name,
      playerName: players.name,
    })
    .from(eventRegistrations)
    .innerJoin(users, eq(eventRegistrations.userId, users.id))
    .leftJoin(players, eq(eventRegistrations.playerId, players.id))
    .where(eq(eventRegistrations.eventId, eventId));

  return Response.json({
    data: {
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: "public",
      eventDate: event.eventDate,
      capacity: event.capacity,
      canceled: event.canceled,
      registrationState: resolveRegistrationState(
        registrations
          .filter((registration) => registration.userId === auth?.user?.id)
          .map((registration) => registration.status),
      ),
      venue: {
        id: event.venueId,
        name: event.venueName,
        address: event.venueAddress,
        city: event.venueCity,
      },
      registrations: registrations.map((registration) => ({
        id: registration.id,
        status: registration.status,
        registeredAt: registration.registeredAt,
        userName: registration.userName,
        playerName: registration.playerName,
      })),
    },
  });
}
