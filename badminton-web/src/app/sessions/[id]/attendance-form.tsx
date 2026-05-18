"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { markAttendanceAction } from "./actions";

function SubmitButton({ label, value }: { label: string; value: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="status"
      value={value}
      disabled={pending}
      className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-black text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-lime-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function AttendanceForm({
  sessionId,
  playerId,
  playerName,
  note,
}: {
  sessionId: number;
  playerId: number;
  playerName: string;
  note: string;
}) {
  const [state, formAction] = useActionState(markAttendanceAction, {});
  const [draftNote, setDraftNote] = useState(note);

  return (
    <form action={formAction} className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="playerId" value={playerId} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-zinc-950" htmlFor={`note-${playerId}`}>
            {playerName}
          </label>
          <textarea
            id={`note-${playerId}`}
            name="note"
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
            rows={2}
            maxLength={240}
            placeholder="Optional note"
            className="mt-2 block w-full rounded-2xl border border-zinc-200 bg-lime-50/50 px-4 py-3 text-sm text-zinc-950 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <SubmitButton label="Attending" value="attending" />
          <SubmitButton label="Not Attending" value="absent" />
          <SubmitButton label="Maybe" value="maybe" />
        </div>
      </div>

      {state.error ? <p className="mt-3 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="mt-3 text-sm text-emerald-700">{state.success}</p> : null}
    </form>
  );
}
