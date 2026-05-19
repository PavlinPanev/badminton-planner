import { and, asc, count, desc, eq, gte, isNull } from "drizzle-orm";

import type { AuthUser } from "@/auth/token";
import { db, eventRegistrations, events, venues } from "@/db";

export type EventCardData = {
  id: number;
  title: string;
  description: string | null;
  eventDate: Date;
  capacity: number | null;
  canceled: boolean;
  venueId: number;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  registrationsCount: number;
};

export type EventFormData = {
  id: number;
  title: string;
  description: string | null;
  eventDate: Date;
  capacity: number | null;
  canceled: boolean;
  venueId: number;
};

export type EventVenueOption = {
  id: number;
  name: string;
  city: string;
};

export function canManageEvents(user: AuthUser) {
  return user.role === "manager" || user.role === "admin";
}

export function formatEventDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function toDateTimeLocal(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(
    value.getMinutes(),
  )}`;
}

async function getRegistrationCount(eventId: number) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventId, eventId));

  return total;
}

export async function getEventsForList(includeCanceledAndPast = false): Promise<EventCardData[]> {
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
      venueAddress: venues.address,
      venueCity: venues.city,
    })
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .where(includeCanceledAndPast ? undefined : and(gte(events.eventDate, new Date()), eq(events.canceled, false)))
    .orderBy(includeCanceledAndPast ? desc(events.eventDate) : asc(events.eventDate));

  const counts = new Map(await Promise.all(rows.map(async (event) => [event.id, await getRegistrationCount(event.id)] as const)));

  return rows.map((event) => ({
    ...event,
    registrationsCount: counts.get(event.id) ?? 0,
  }));
}

export async function getEventDetail(eventId: number) {
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
    return { status: "not-found" as const, event: null };
  }

  return {
    status: "ok" as const,
    event: {
      ...event,
      registrationsCount: await getRegistrationCount(event.id),
    },
  };
}

export async function getEditableEvent(eventId: number) {
  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
      capacity: events.capacity,
      canceled: events.canceled,
      venueId: events.venueId,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    return { status: "not-found" as const, event: null };
  }

  return {
    status: "ok" as const,
    event,
  };
}

export async function getEventDeleteInfo(eventId: number) {
  const result = await getEventDetail(eventId);

  if (result.status === "not-found") {
    return { status: "not-found" as const, event: null };
  }

  return {
    status: "ok" as const,
    event: {
      ...result.event,
      isUsed: result.event.registrationsCount > 0,
    },
  };
}

export async function getActiveEventVenueOptions(): Promise<EventVenueOption[]> {
  return db
    .select({
      id: venues.id,
      name: venues.name,
      city: venues.city,
    })
    .from(venues)
    .where(isNull(venues.archivedAt))
    .orderBy(asc(venues.city), asc(venues.name));
}
