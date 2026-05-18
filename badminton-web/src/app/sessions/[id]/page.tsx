import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { AttendanceBadge, CanceledBadge, CapacityBadge, StateBadge } from "@/components/session-badges";
import { canCancelSession, getSessionDetailForUser } from "@/lib/session-data";
import { formatSessionDate, formatSessionTime, getSessionEnd, sessionDurationMinutes } from "@/lib/session-status";
import { cancelSessionAction } from "./actions";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const sessionId = Number(id);

  if (!Number.isInteger(sessionId)) {
    notFound();
  }

  const session = await getSessionDetailForUser(sessionId, user);

  if (!session) {
    notFound();
  }

  const endTime = getSessionEnd(session.sessionDate, session.startTime).toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const canCancel = !session.canceled && (await canCancelSession(session.id, user));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
        Back to dashboard
      </Link>

      <section className="mt-6 rounded-md border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600">
              {formatSessionDate(session.sessionDate)} at {formatSessionTime(session.startTime)}-{endTime}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">{session.groupTitle}</h1>
            <p className="mt-2 text-base text-zinc-700">{session.venueName}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <StateBadge state={session.state} />
            {session.canceled ? <CanceledBadge /> : null}
            <CapacityBadge state={session.capacityState} />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Attendance</dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {session.attendanceSummary.attending} attending, {session.attendanceSummary.absent} absent
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Maybe</dt>
            <dd className="mt-1 text-sm text-zinc-800">{session.attendanceSummary.maybe}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">No response</dt>
            <dd className="mt-1 text-sm text-zinc-800">{session.attendanceSummary["no response"]}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Comments</dt>
            <dd className="mt-1 text-sm text-zinc-800">{session.commentsCount}</dd>
          </div>
        </dl>

        <p className="mt-5 text-sm text-zinc-600">
          Sessions are current for {sessionDurationMinutes} minutes after their start time. Attendance is open
          when a session is upcoming or current and not canceled.
        </p>

        {canCancel ? (
          <form action={cancelSessionAction} className="mt-6">
            <input type="hidden" name="sessionId" value={session.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              Cancel session
            </button>
          </form>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">Members and Attendance</h2>
        <div className="mt-5 overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600 md:grid-cols-[1fr_120px_140px_1fr]">
            <span>Member</span>
            <span className="hidden md:block">Role</span>
            <span>Attendance</span>
            <span className="hidden md:block">Note</span>
          </div>
          {session.members.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_120px_140px_1fr]"
            >
              <div>
                <p className="font-medium text-zinc-950">{member.name}</p>
                <p className="mt-1 text-xs text-zinc-600 md:hidden">{member.role}</p>
                {member.note ? <p className="mt-2 text-xs text-zinc-600 md:hidden">{member.note}</p> : null}
              </div>
              <span className="hidden text-zinc-700 md:block">{member.role}</span>
              <AttendanceBadge status={member.attendance} />
              <span className="hidden text-zinc-600 md:block">{member.note ?? ""}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
