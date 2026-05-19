import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { SectionHeader } from "@/components/ui/surfaces";
import { canManageEvents, getActiveEventVenueOptions, getEditableEvent } from "@/lib/event-data";
import { updateEventAction } from "../../actions";
import { EventForm } from "../../event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/events");
  }

  if (!canManageEvents(user)) {
    redirect("/events");
  }

  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isInteger(eventId)) {
    notFound();
  }

  const [result, venues] = await Promise.all([getEditableEvent(eventId), getActiveEventVenueOptions()]);

  if (result.status === "not-found") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/events/${eventId}`} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to event
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sky-600 via-emerald-500 to-lime-400 p-6 text-white shadow-[0_24px_70px_rgba(16,185,129,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Manager tools
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Edit {result.event.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Update event details or mark this event as canceled.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow="Event setup" title="Edit Event" description="Update the public event record." />
        <div className="mt-5">
          <EventForm action={updateEventAction} venues={venues} event={result.event} submitLabel="Save event" />
        </div>
      </section>
    </div>
  );
}
