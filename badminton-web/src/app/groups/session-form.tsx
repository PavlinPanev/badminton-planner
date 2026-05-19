"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CalendarPlus } from "lucide-react";

import type { CoachOption, SessionFormData, VenueOption } from "@/lib/group-data";
import type { SessionActionState } from "./session-actions";

type SessionFormProps = {
  action: (state: SessionActionState, formData: FormData) => Promise<SessionActionState>;
  groupId: number;
  venues: VenueOption[];
  coaches: CoachOption[];
  session?: SessionFormData;
  submitLabel: string;
};

const inputClass =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CalendarPlus aria-hidden="true" className="h-4 w-4" />
      {pending ? "Saving..." : label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-950">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function SessionForm({ action, groupId, venues, coaches, session, submitLabel }: SessionFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 sm:p-6"
    >
      <input type="hidden" name="groupId" value={groupId} />
      {session ? <input type="hidden" name="sessionId" value={session.id} /> : null}

      {state.error ? (
        <p className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Session date">
            <input
              name="sessionDate"
              type="date"
              required
              defaultValue={session?.sessionDate ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Start time">
            <input
              name="startTime"
              type="time"
              required
              defaultValue={session?.startTime.slice(0, 5) ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Venue">
            <select name="venueId" required defaultValue={session?.venueId ?? venues[0]?.id ?? ""} className={inputClass}>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}, {venue.city}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Coach">
            <select name="coachUserId" defaultValue={session?.coachUserId ?? ""} className={inputClass}>
              <option value="">Not assigned</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name} ({coach.email})
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
            defaultValue={session?.capacity ?? ""}
            placeholder="Leave empty for open capacity"
            className={inputClass}
          />
        </Field>

        {session ? (
          <label className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950 ring-1 ring-amber-200">
            <input
              type="checkbox"
              name="canceled"
              defaultChecked={session.canceled}
              className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <span>
              Cancel this session
              <span className="mt-1 block text-xs font-semibold text-amber-800">
                Canceled sessions stay visible in the group schedule and session archive.
              </span>
            </span>
          </label>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-zinc-500">
          Sessions are visible to members of this group and can be managed by group coaches, managers, and admins.
        </p>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
