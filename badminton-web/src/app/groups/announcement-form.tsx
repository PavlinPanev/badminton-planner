"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Megaphone } from "lucide-react";

import type { AnnouncementFormData } from "@/lib/group-data";
import type { AnnouncementActionState } from "./announcement-actions";

type AnnouncementFormProps = {
  action: (state: AnnouncementActionState, formData: FormData) => Promise<AnnouncementActionState>;
  groupId: number;
  announcement?: AnnouncementFormData;
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
      <Megaphone aria-hidden="true" className="h-4 w-4" />
      {pending ? "Saving..." : label}
    </button>
  );
}

export function AnnouncementForm({ action, groupId, announcement, submitLabel }: AnnouncementFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 sm:p-6"
    >
      <input type="hidden" name="groupId" value={groupId} />
      {announcement ? <input type="hidden" name="announcementId" value={announcement.id} /> : null}

      {state.error ? (
        <p className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5">
        <Field label="Title">
          <input
            name="title"
            required
            maxLength={255}
            defaultValue={announcement?.title ?? ""}
            placeholder="Next week's training update"
            className={inputClass}
          />
        </Field>

        <Field label="Announcement">
          <textarea
            name="content"
            rows={6}
            maxLength={4000}
            defaultValue={announcement?.content ?? ""}
            placeholder="Share updates, reminders, or schedule changes with the group."
            className={`${inputClass} resize-y leading-6`}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-zinc-500">
          Announcements are visible to all connected members and synced to the mobile app.
        </p>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
