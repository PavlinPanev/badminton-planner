import { asc } from "drizzle-orm";

import { db, venues } from "@/db";

export const dynamic = "force-dynamic";

export default async function PublicVenuesPage() {
  const venueRows = await db.select().from(venues).orderBy(asc(venues.city), asc(venues.name));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">Venues</h1>
        <p className="mt-3 text-base leading-7 text-zinc-700">
          Demo badminton halls and training locations used by the club.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {venueRows.map((venue) => (
          <article key={venue.id} className="rounded-md border border-zinc-200 bg-white p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-lg font-semibold text-zinc-950">{venue.name}</h2>
              <span className="text-sm font-medium text-emerald-700">{venue.city}</span>
            </div>
            <p className="mt-3 text-sm text-zinc-700">{venue.address}</p>
            {venue.description ? (
              <p className="mt-3 text-sm leading-6 text-zinc-600">{venue.description}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
