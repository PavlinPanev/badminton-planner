"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

import { leaveGroupAction } from "./actions";

function LeaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      {pending ? "Leaving..." : "Leave group"}
    </button>
  );
}

export function LeaveGroupPanel({
  groupId,
  currentUserRole,
}: {
  groupId: number;
  currentUserRole: string | null;
}) {
  const [state, formAction] = useActionState(leaveGroupAction, {});

  return (
    <div className="mt-5 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black text-zinc-950">
            <LogOut aria-hidden="true" className="h-4 w-4 text-rose-700" />
            Leave this group
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            This removes your user membership from the group. Linked player memberships are not removed.
          </p>
          {currentUserRole === "manager" ? (
            <p className="mt-2 text-xs font-bold text-amber-700">
              Managers must leave at least one other manager in the group.
            </p>
          ) : null}
        </div>
        <form action={formAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <LeaveButton />
        </form>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
