"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";

import type { GroupFormData, VenueOption } from "@/lib/group-data";
import type { GroupActionState } from "./actions";

type GroupFormProps = {
  action: (state: GroupActionState, formData: FormData) => Promise<GroupActionState>;
  venues: VenueOption[];
  group?: GroupFormData;
  submitLabel: string;
};

const groupLevels = ["beginner", "intermediate", "advanced", "competitive"] as const;

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

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-950">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

export function GroupForm({ action, venues, group, submitLabel }: GroupFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 sm:p-6"
    >
      {group ? <input type="hidden" name="groupId" value={group.id} /> : null}

      {state.error ? (
        <p className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5">
        <Field label="Group title">
          <input
            name="title"
            defaultValue={group?.title ?? ""}
            maxLength={180}
            required
            placeholder="Junior Performance Squad"
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            defaultValue={group?.description ?? ""}
            rows={5}
            maxLength={1200}
            placeholder="Describe the group focus, training rhythm, or membership notes."
            className={`${inputClass} resize-y leading-6`}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Level">
            <select name="level" defaultValue={group?.level ?? "beginner"} className={inputClass}>
              {groupLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Venue">
            <select name="venueId" defaultValue={group?.venueId ?? venues[0]?.id ?? ""} required className={inputClass}>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}, {venue.city}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Minimum age">
            <input
              name="minAge"
              type="number"
              min={0}
              defaultValue={group?.minAge ?? ""}
              placeholder="8"
              className={inputClass}
            />
          </Field>

          <Field label="Maximum age">
            <input
              name="maxAge"
              type="number"
              min={0}
              defaultValue={group?.maxAge ?? ""}
              placeholder="14"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-zinc-500">
          Group managers can update this information later from the group details page.
        </p>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
