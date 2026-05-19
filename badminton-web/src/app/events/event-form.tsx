"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";

import type { EventFormData, EventVenueOption } from "@/lib/event-data";
import { toDateTimeLocal } from "@/lib/event-data";
import type { EventActionState } from "./actions";

type EventFormProps = {
  action: (state: EventActionState, formData: FormData) => Promise<EventActionState>;
  venues: EventVenueOption[];
  event?: EventFormData;
  submitLabel: string;
};

const inputClass =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-950">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save aria-hidden="true" className="h-4 w-4" />
      {pending ? "Saving..." : label}
    </button>
  );
}

export function EventForm({ action, venues, event, submitLabel }: EventFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 sm:p-6"
    >
      {event ? <input type="hidden" name="eventId" value={event.id} /> : null}
      {state.error ? (
        <p className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5">
        <Field label="Event title">
          <input
            name="title"
            required
            maxLength={180}
            defaultValue={event?.title ?? ""}
            placeholder="Spring Junior Tournament"
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={5}
            maxLength={1200}
            defaultValue={event?.description ?? ""}
            placeholder="Describe the event, expected audience, and useful preparation notes."
            className={`${inputClass} resize-y leading-6`}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Date and time">
            <input
              name="eventDate"
              type="datetime-local"
              required
              defaultValue={event ? toDateTimeLocal(event.eventDate) : ""}
              className={inputClass}
            />
          </Field>

          <Field label="Venue">
            <select name="venueId" required defaultValue={event?.venueId ?? venues[0]?.id ?? ""} className={inputClass}>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}, {venue.city}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Capacity">
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={event?.capacity ?? ""}
            placeholder="Leave empty for open capacity"
            className={inputClass}
          />
        </Field>

        {event ? (
          <label className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950 ring-1 ring-amber-200">
            <input
              type="checkbox"
              name="canceled"
              defaultChecked={event.canceled}
              className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <span>
              Cancel this event
              <span className="mt-1 block text-xs font-semibold text-amber-800">
                Canceled events remain visible to managers and preserve registrations.
              </span>
            </span>
          </label>
        ) : null}
      </div>

      <div className="mt-6 flex justify-end border-t border-zinc-100 pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
