import { and, asc, count, desc, eq, gte, inArray, isNull } from "drizzle-orm";

import type { AuthUser } from "@/auth/token";
import { db, eventRegistrations, events, venues } from "@/db";
import { canManageEvents } from "./permissions";

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

export type EventListOptions = {
  page?: number;
  pageSize?: number;
  includeCanceledAndPast?: boolean;
};

export type EventListResult = {
  events: EventCardData[];
  paging: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
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

export { canManageEvents };

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

function normalizePage(value: number | undefined) {
  return Math.max(Number(value) || 1, 1);
}

function normalizePageSize(value: number | undefined) {
  return Math.min(Math.max(Number(value) || 12, 1), 48);
}

async function getRegistrationCounts(eventIds: number[]) {
  if (!eventIds.length) {
    return new Map<number, number>();
  }

  const rows = await db
    .select({
      eventId: eventRegistrations.eventId,
      total: count(),
    })
    .from(eventRegistrations)
    .where(inArray(eventRegistrations.eventId, eventIds))
    .groupBy(eventRegistrations.eventId);

  return new Map(rows.map((row) => [row.eventId, row.total]));
}

export async function getEventsForList(options: EventListOptions = {}): Promise<EventListResult> {
  const includeCanceledAndPast = options.includeCanceledAndPast ?? false;
  const page = normalizePage(options.page);
  const pageSize = normalizePageSize(options.pageSize);
  const offset = (page - 1) * pageSize;
  const where = includeCanceledAndPast ? undefined : and(gte(events.eventDate, new Date()), eq(events.canceled, false));
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
      venueAddress: venues.address,
      venueCity: venues.city,
    })
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .where(where)
    .orderBy(includeCanceledAndPast ? desc(events.eventDate) : asc(events.eventDate), asc(events.id))
    .limit(pageSize)
    .offset(offset);

  const counts = await getRegistrationCounts(rows.map((event) => event.id));

  return {
    events: rows.map((event) => ({
      ...event,
      registrationsCount: counts.get(event.id) ?? 0,
    })),
    paging: {
      page,
      pageSize,
      total: totalCount,
      totalPages: Math.max(Math.ceil(totalCount / pageSize), 1),
    },
  };
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
