"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";

import type { VenueFormData } from "@/lib/venue-data";
import type { VenueActionState } from "./actions";

type VenueFormProps = {
  action: (state: VenueActionState, formData: FormData) => Promise<VenueActionState>;
  venue?: VenueFormData;
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

export function VenueForm({ action, venue, submitLabel }: VenueFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 sm:p-6"
    >
      {venue ? <input type="hidden" name="venueId" value={venue.id} /> : null}
      {state.error ? (
        <p className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Venue name">
            <input
              name="name"
              required
              maxLength={180}
              defaultValue={venue?.name ?? ""}
              placeholder="Riverside Sports Hall"
              className={inputClass}
            />
          </Field>
          <Field label="City">
            <input
              name="city"
              required
              maxLength={120}
              defaultValue={venue?.city ?? ""}
              placeholder="Sofia"
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Address">
          <input
            name="address"
            required
            maxLength={500}
            defaultValue={venue?.address ?? ""}
            placeholder="12 Court Street"
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            rows={5}
            maxLength={1200}
            defaultValue={venue?.description ?? ""}
            placeholder="Useful access, court, parking, or changing room notes."
            className={`${inputClass} resize-y leading-6`}
          />
        </Field>
      </div>

      <div className="mt-6 flex justify-end border-t border-zinc-100 pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
