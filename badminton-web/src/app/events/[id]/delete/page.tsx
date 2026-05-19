import Link from "next/link";
import { AlertTriangle, Ban, Trash2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { Card } from "@/components/ui/surfaces";
import { canManageEvents, formatEventDate, getEventDeleteInfo } from "@/lib/event-data";
import { deleteOrCancelEventAction } from "../../actions";

export default async function DeleteEventPage({
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

  const result = await getEventDeleteInfo(eventId);

  if (result.status === "not-found") {
    notFound();
  }

  const event = result.event;
  const actionLabel = event.isUsed ? "Cancel event" : "Delete event";
  const ActionIcon = event.isUsed ? Ban : Trash2;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/events/${event.id}`} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to event
      </Link>

      <Card className="mt-6 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-violet-500" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Confirm action</p>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-zinc-950">
                {event.isUsed ? "Cancel" : "Delete"} {event.title}?
              </h1>
              <p className="mt-4 text-sm leading-6 text-zinc-700">
                {event.isUsed
                  ? "This event has registrations, so it will be canceled and kept for history."
                  : "This event has no registrations, so it can be permanently deleted."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            <span className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-black text-sky-900">
              {formatEventDate(event.eventDate)}
            </span>
            <span className="rounded-2xl bg-lime-50 px-4 py-3 text-sm font-black text-lime-950">
              {event.venueName}
            </span>
            <span className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-black text-violet-900">
              {event.registrationsCount} registrations
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-rose-800">Managers can also cancel events from the edit page.</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/events/${event.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-black text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-100"
              >
                Cancel
              </Link>
              <form action={deleteOrCancelEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
                >
                  <ActionIcon aria-hidden="true" className="h-4 w-4" />
                  {actionLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
