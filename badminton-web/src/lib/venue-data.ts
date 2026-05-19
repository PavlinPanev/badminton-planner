import { and, asc, count, eq, isNull } from "drizzle-orm";

import type { AuthUser } from "@/auth/token";
import { db, events, groups, sessions, venues } from "@/db";
import { canManageVenues } from "./permissions";

export type VenueCardData = {
  id: number;
  name: string;
  address: string;
  city: string;
  description: string | null;
  archivedAt: Date | null;
  groupsCount: number;
  sessionsCount: number;
  eventsCount: number;
};

export type VenueFormData = {
  id: number;
  name: string;
  address: string;
  city: string;
  description: string | null;
};

export { canManageVenues };

async function getVenueUsage(venueId: number) {
  const [[{ total: groupsCount }], [{ total: sessionsCount }], [{ total: eventsCount }]] = await Promise.all([
    db.select({ total: count() }).from(groups).where(eq(groups.venueId, venueId)),
    db.select({ total: count() }).from(sessions).where(eq(sessions.venueId, venueId)),
    db.select({ total: count() }).from(events).where(eq(events.venueId, venueId)),
  ]);

  return {
    groupsCount,
    sessionsCount,
    eventsCount,
  };
}

export async function getVenuesForList(includeArchived = false): Promise<VenueCardData[]> {
  const rows = await db
    .select({
      id: venues.id,
      name: venues.name,
      address: venues.address,
      city: venues.city,
      description: venues.description,
      archivedAt: venues.archivedAt,
    })
    .from(venues)
    .where(includeArchived ? undefined : isNull(venues.archivedAt))
    .orderBy(asc(venues.city), asc(venues.name));

  const usage = new Map(await Promise.all(rows.map(async (venue) => [venue.id, await getVenueUsage(venue.id)] as const)));

  return rows.map((venue) => ({
    ...venue,
    ...(usage.get(venue.id) ?? { groupsCount: 0, sessionsCount: 0, eventsCount: 0 }),
  }));
}

export async function getEditableVenue(venueId: number) {
  const [venue] = await db
    .select({
      id: venues.id,
      name: venues.name,
      address: venues.address,
      city: venues.city,
      description: venues.description,
    })
    .from(venues)
    .where(eq(venues.id, venueId))
    .limit(1);

  if (!venue) {
    return { status: "not-found" as const, venue: null };
  }

  return {
    status: "ok" as const,
    venue,
  };
}

export async function getVenueDeleteInfo(venueId: number) {
  const [venue] = await db
    .select({
      id: venues.id,
      name: venues.name,
      address: venues.address,
      city: venues.city,
      archivedAt: venues.archivedAt,
    })
    .from(venues)
    .where(eq(venues.id, venueId))
    .limit(1);

  if (!venue) {
    return { status: "not-found" as const, venue: null };
  }

  const usage = await getVenueUsage(venueId);

  return {
    status: "ok" as const,
    venue: {
      ...venue,
      ...usage,
      isUsed: usage.groupsCount + usage.sessionsCount + usage.eventsCount > 0,
    },
  };
}

export async function venueExistsActive(venueId: number) {
  const [venue] = await db
    .select({ id: venues.id })
    .from(venues)
    .where(and(eq(venues.id, venueId), isNull(venues.archivedAt)))
    .limit(1);

  return Boolean(venue);
}
