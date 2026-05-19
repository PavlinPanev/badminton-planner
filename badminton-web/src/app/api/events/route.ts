import { and, asc, count, eq, gte, inArray } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getApiUser, paginationMeta, parsePage } from "@/auth/api";
import { db, eventRegistrations, events, venues } from "@/db";

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

export async function GET(request: NextRequest) {
  const hasBearerToken = request.headers.get("authorization")?.toLowerCase().startsWith("bearer ");
  const auth = hasBearerToken ? await getApiUser(request) : null;

  if (auth?.error) {
    return auth.error;
  }

  const { page, pageSize, offset } = parsePage(request);
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
    .limit(pageSize)
    .offset(offset);

  const pageEventIds = rows.map((event) => event.id);
  const registrations =
    auth?.user && pageEventIds.length
      ? await db
          .select({
            eventId: eventRegistrations.eventId,
            status: eventRegistrations.status,
          })
          .from(eventRegistrations)
          .where(and(eq(eventRegistrations.userId, auth.user.id), inArray(eventRegistrations.eventId, pageEventIds)))
      : [];

  const registrationStatusesByEventId = registrations.reduce<Map<number, string[]>>((map, registration) => {
    const statuses = map.get(registration.eventId) ?? [];
    statuses.push(registration.status);
    map.set(registration.eventId, statuses);
    return map;
  }, new Map());

  return Response.json({
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
    paging: paginationMeta(page, pageSize, totalCount),
  });
}
