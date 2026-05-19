"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Link2, Plus } from "lucide-react";

import { createGroupInviteAction } from "./invite-actions";

function CreateInviteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus aria-hidden="true" className="h-4 w-4" />
      {pending ? "Creating..." : "Create Invite Link"}
    </button>
  );
}

export function InviteLinkPanel({ groupId }: { groupId: number }) {
  const [state, formAction] = useActionState(createGroupInviteAction, {});
  const inviteUrl =
    typeof window !== "undefined" && state.invitePath ? `${window.location.origin}${state.invitePath}` : state.invitePath;

  return (
    <div className="mt-5 rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black text-zinc-950">
            <Link2 aria-hidden="true" className="h-4 w-4 text-emerald-700" />
            Group invite link
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Each generated link can be used by one logged-in person to join this group.
          </p>
        </div>
        <form action={formAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <CreateInviteButton />
        </form>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      ) : null}

      {inviteUrl ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Invite created</p>
          <p className="mt-2 break-all text-sm font-bold text-emerald-950">{inviteUrl}</p>
        </div>
      ) : null}
    </div>
  );
}
