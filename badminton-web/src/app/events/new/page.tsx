import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { SectionHeader } from "@/components/ui/surfaces";
import { canManageEvents, getActiveEventVenueOptions } from "@/lib/event-data";
import { createEventAction } from "../actions";
import { EventForm } from "../event-form";

export default async function NewEventPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/events/new");
  }

  if (!canManageEvents(user)) {
    redirect("/events");
  }

  const venues = await getActiveEventVenueOptions();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/events" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to events
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-emerald-600 via-sky-500 to-violet-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Manager tools
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Create Event</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Add a tournament, camp, social session, or club activity.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow="Event setup" title="New Event" description="Create the event record shown to members." />
        <div className="mt-5">
          <EventForm action={createEventAction} venues={venues} submitLabel="Create event" />
        </div>
      </section>
    </div>
  );
}
