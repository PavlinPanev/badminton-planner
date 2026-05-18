import { asc, eq, gte } from "drizzle-orm";

import { db, events, venues } from "@/db";

export const dynamic = "force-dynamic";

function formatEventDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function PublicEventsPage() {
  const eventRows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
      capacity: events.capacity,
      canceled: events.canceled,
      venueName: venues.name,
      city: venues.city,
    })
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .where(gte(events.eventDate, new Date()))
    .orderBy(asc(events.eventDate));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">Upcoming Events</h1>
        <p className="mt-3 text-base leading-7 text-zinc-700">
          Public club events, tournaments, camps, and open training days.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {eventRows.map((event) => (
          <article key={event.id} className="rounded-md border border-zinc-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950">{event.title}</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {event.venueName}, {event.city}
                </p>
              </div>
              <span className="text-sm font-semibold text-emerald-700">
                {formatEventDate(event.eventDate)}
              </span>
            </div>
            {event.description ? (
              <p className="mt-4 text-sm leading-6 text-zinc-700">{event.description}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-zinc-700">
              {event.capacity ? (
                <span className="rounded bg-zinc-100 px-2 py-1">Capacity {event.capacity}</span>
              ) : null}
              {event.canceled ? (
                <span className="rounded bg-red-50 px-2 py-1 text-red-700">Canceled</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {eventRows.length === 0 ? (
        <p className="mt-8 rounded-md border border-zinc-200 bg-white p-5 text-sm text-zinc-700">
          There are no public upcoming events yet.
        </p>
      ) : null}
    </section>
  );
}
