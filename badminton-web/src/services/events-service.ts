import "server-only";

import { and, asc, count, eq, gte, inArray, isNull } from "drizzle-orm";

import type { AuthUser } from "@/auth/token";
import { paginationMeta } from "@/auth/api";
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

export async function listEvents(user: AuthUser | null, options: { page: number; pageSize: number; offset: number }) {
  const where = gte(events.eventDate, new Date());
  const [{ total: totalCount }] = await db.select({ total: count() }).from(events).where(where);
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
      capacity: events.capacity,
      canceled: events.canceled,
      venueId: venues.id,
      venueName: venues.name,
      city: venues.city,
    })
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .where(where)
    .orderBy(asc(events.eventDate), asc(events.id))
    .limit(options.pageSize)
    .offset(options.offset);

  const pageEventIds = rows.map((event) => event.id);
  const registrations =
    user && pageEventIds.length
      ? await db
          .select({
            eventId: eventRegistrations.eventId,
            status: eventRegistrations.status,
          })
          .from(eventRegistrations)
          .where(and(eq(eventRegistrations.userId, user.id), inArray(eventRegistrations.eventId, pageEventIds)))
      : [];

  const registrationStatusesByEventId = registrations.reduce<Map<number, string[]>>((map, registration) => {
    const statuses = map.get(registration.eventId) ?? [];
    statuses.push(registration.status);
    map.set(registration.eventId, statuses);
    return map;
  }, new Map());

  return {
    data: rows.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: "public",
      eventDate: event.eventDate,
      capacity: event.capacity,
      canceled: event.canceled,
      registrationState: resolveRegistrationState(registrationStatusesByEventId.get(event.id) ?? []),
      venue: {
        id: event.venueId,
        name: event.venueName,
        city: event.city,
      },
    })),
    paging: paginationMeta(options.page, options.pageSize, totalCount),
  };
}

export async function getEventDetail(eventId: number, user: AuthUser | null) {
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
    return { status: "not-found" as const };
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

  return {
    status: "ok" as const,
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
          .filter((registration) => registration.userId === user?.id)
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
  };
}

export async function registerForEvent(user: AuthUser, eventId: number, playerId: number | null) {
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  if (!event) {
    return { status: "not-found" as const };
  }

  if (event.canceled) {
    return { status: "canceled" as const };
  }

  if (playerId !== null) {
    const [player] = await db
      .select({ id: players.id })
      .from(players)
      .where(and(eq(players.id, playerId), eq(players.parentUserId, user.id)))
      .limit(1);

    if (!player) {
      return { status: "forbidden-player" as const };
    }
  }

  const existingWhere =
    playerId === null
      ? and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, user.id), isNull(eventRegistrations.playerId))
      : and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, user.id), eq(eventRegistrations.playerId, playerId));

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
          userId: user.id,
          playerId,
          status: "registered",
          registeredAt: new Date(),
        })
        .returning();

  return { status: "ok" as const, data: registration };
}

export async function cancelEventRegistration(user: AuthUser, eventId: number, playerId: number | null) {
  const existingWhere =
    playerId === null
      ? and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, user.id), isNull(eventRegistrations.playerId))
      : and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, user.id), eq(eventRegistrations.playerId, playerId));

  const [registration] = await db
    .update(eventRegistrations)
    .set({ status: "canceled" })
    .where(existingWhere)
    .returning();

  if (!registration) {
    return { status: "not-found" as const };
  }

  return { status: "ok" as const, data: registration };
}
