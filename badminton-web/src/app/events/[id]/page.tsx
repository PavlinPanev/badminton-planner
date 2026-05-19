import Link from "next/link";
import { CalendarDays, MapPin, Pencil, Trash2, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { Card, SectionHeader } from "@/components/ui/surfaces";
import { canManageEvents, formatEventDate, getEventDetail } from "@/lib/event-data";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isInteger(eventId)) {
    notFound();
  }

  const [user, result] = await Promise.all([getCurrentUser(), getEventDetail(eventId)]);

  if (result.status === "not-found") {
    notFound();
  }

  const event = result.event;
  const canManage = user ? canManageEvents(user) : false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/events" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to events
      </Link>

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.25)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-lime-100 ring-1 ring-white/30">
          Event details
        </p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-normal sm:text-5xl">{event.title}</h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/90">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                {formatEventDate(event.eventDate)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                {event.venueName}, {event.venueCity}
              </span>
              <span className="inline-flex items-center gap-2">
                <UsersRound aria-hidden="true" className="h-4 w-4" />
                {event.registrationsCount} registrations
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {event.canceled ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-900 ring-1 ring-rose-200">
                canceled
              </span>
            ) : null}
            {canManage ? (
              <>
                <Link
                  href={`/events/${event.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                  Edit
                </Link>
                <Link
                  href={`/events/${event.id}/delete`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Delete
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <SectionHeader eyebrow="Overview" title="Description" description="Event information for members and guests." />
          <p className="mt-5 text-sm leading-7 text-zinc-700">
            {event.description ?? "No event description has been added yet."}
          </p>
        </Card>
        <Card className="p-6">
          <SectionHeader eyebrow="Location" title="Venue" description="Where this event takes place." />
          <p className="mt-5 text-lg font-black text-zinc-950">{event.venueName}</p>
          <p className="mt-2 text-sm font-semibold text-zinc-700">{event.venueAddress}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-600">{event.venueCity}</p>
        </Card>
      </section>
    </div>
  );
}
