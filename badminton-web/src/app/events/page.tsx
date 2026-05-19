import Link from "next/link";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";

import { getCurrentUser } from "@/auth/session";
import { Card, SectionHeader } from "@/components/ui/surfaces";
import { canManageEvents, formatEventDate, getEventsForList, type EventCardData } from "@/lib/event-data";

export const dynamic = "force-dynamic";

function EventCard({ event, canManage }: { event: EventCardData; canManage: boolean }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5">
      <div className={event.canceled ? "h-2 bg-gradient-to-r from-rose-400 to-zinc-400" : "h-2 bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500"} />
      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href={`/events/${event.id}`} className="text-xl font-black tracking-normal text-zinc-950 hover:text-emerald-800">
              {event.title}
            </Link>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-zinc-600">
              <MapPin aria-hidden="true" className="h-4 w-4 text-emerald-700" />
              {event.venueName}, {event.venueCity}
            </p>
          </div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-900 ring-1 ring-sky-200">
            {formatEventDate(event.eventDate)}
          </span>
        </div>
        {event.description ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">{event.description}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-2xl bg-lime-50 px-3 py-2 text-xs font-black text-lime-950">
            {event.capacity ? `Capacity ${event.capacity}` : "Open capacity"}
          </span>
          <span className="rounded-2xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-900">
            {event.registrationsCount} registrations
          </span>
          {event.canceled ? (
            <span className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">Canceled</span>
          ) : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex min-h-10 items-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            Details
          </Link>
          {canManage ? (
            <>
              <Link
                href={`/events/${event.id}/edit`}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-100"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
                Edit
              </Link>
              <Link
                href={`/events/${event.id}/delete`}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Delete
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const user = await getCurrentUser();
  const canManage = user ? canManageEvents(user) : false;
  const eventRows = await getEventsForList(canManage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Club events
        </p>
        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal sm:text-5xl">Events</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
              Tournaments, camps, social sessions, and club activities.
            </p>
          </div>
          {canManage ? (
            <Link
              href="/events/new"
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
          eyebrow={canManage ? "Manager view" : "Upcoming"}
          title={canManage ? "All Events" : "Upcoming Events"}
          description={canManage ? "Manage upcoming, past, and canceled events." : "Public upcoming club events."}
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {eventRows.map((event) => (
            <EventCard key={event.id} event={event} canManage={canManage} />
          ))}
        </div>
        {!eventRows.length ? (
          <Card className="mt-6 p-6">
            <p className="font-bold text-zinc-950">No events found</p>
            <p className="mt-2 text-sm text-zinc-600">There are no public upcoming events yet.</p>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
