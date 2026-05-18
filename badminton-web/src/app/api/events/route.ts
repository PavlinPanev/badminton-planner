import { asc, eq, gte } from "drizzle-orm";
import { NextRequest } from "next/server";

import { parsePage } from "@/auth/api";
import { db, events, venues } from "@/db";

export async function GET(request: NextRequest) {
  const { page, pageSize, offset } = parsePage(request);
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
    .where(gte(events.eventDate, new Date()))
    .orderBy(asc(events.eventDate));

  const pageItems = rows.slice(offset, offset + pageSize);

  return Response.json({
    data: pageItems.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      capacity: event.capacity,
      canceled: event.canceled,
      venue: {
        id: event.venueId,
        name: event.venueName,
        city: event.city,
      },
    })),
    paging: {
      page,
      pageSize,
      total: rows.length,
      hasMore: offset + pageSize < rows.length,
    },
  });
}
