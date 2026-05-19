import Link from "next/link";
import { Archive, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

import { getCurrentUser } from "@/auth/session";
import { Card, SectionHeader } from "@/components/ui/surfaces";
import { canManageVenues, getVenuesForList, type VenueCardData } from "@/lib/venue-data";

export const dynamic = "force-dynamic";

function VenueCard({ venue, canManage }: { venue: VenueCardData; canManage: boolean }) {
  const archived = Boolean(venue.archivedAt);

  return (
    <article className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5">
      <div className={archived ? "h-2 bg-gradient-to-r from-zinc-300 to-zinc-500" : "h-2 bg-gradient-to-r from-emerald-400 via-lime-300 to-sky-400"} />
      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-normal text-zinc-950">{venue.name}</h2>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-zinc-600">
              <MapPin aria-hidden="true" className="h-4 w-4 text-emerald-700" />
              {venue.address}, {venue.city}
            </p>
          </div>
          {archived ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700 ring-1 ring-zinc-200">
              <Archive aria-hidden="true" className="h-4 w-4" />
              archived
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 ring-1 ring-emerald-200">
              active
            </span>
          )}
        </div>
        {venue.description ? <p className="mt-4 text-sm leading-6 text-zinc-600">{venue.description}</p> : null}
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <span className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-900">{venue.groupsCount} groups</span>
          <span className="rounded-2xl bg-lime-50 px-3 py-2 text-xs font-black text-lime-950">{venue.sessionsCount} sessions</span>
          <span className="rounded-2xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-900">{venue.eventsCount} events</span>
        </div>
        {canManage ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/venues/${venue.id}/edit`}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100"
            >
              <Pencil aria-hidden="true" className="h-4 w-4" />
              Edit
            </Link>
            <Link
              href={`/venues/${venue.id}/delete`}
              className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Delete
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default async function PublicVenuesPage() {
  const user = await getCurrentUser();
  const canManage = user ? canManageVenues(user) : false;
  const venueRows = await getVenuesForList(canManage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-sky-500 to-violet-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Club locations
        </p>
        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal sm:text-5xl">Venues</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
              Badminton halls and training locations used by the club.
            </p>
          </div>
          {canManage ? (
            <Link
              href="/venues/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-emerald-800 shadow-lg shadow-emerald-900/10 transition hover:bg-lime-50 focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          eyebrow={canManage ? "Manager view" : "Directory"}
          title={canManage ? "All Venues" : "Active Venues"}
          description={canManage ? "Manage active and archived venues." : "Archived venues are hidden from the public venue directory."}
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {venueRows.map((venue) => (
            <VenueCard key={venue.id} venue={venue} canManage={canManage} />
          ))}
        </div>
        {!venueRows.length ? (
          <Card className="mt-6 p-6">
            <p className="font-bold text-zinc-950">No venues found</p>
            <p className="mt-2 text-sm text-zinc-600">No active venues are available yet.</p>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
