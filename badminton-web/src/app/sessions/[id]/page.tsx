import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { AttendanceBadge, CanceledBadge, CapacityBadge, StateBadge } from "@/components/session-badges";
import { canCancelSession, getAttendanceTargetsForUser, getSessionDetailForUser } from "@/lib/session-data";
import { formatSessionDate, formatSessionTime, getSessionEnd, sessionDurationMinutes } from "@/lib/session-status";
import { AttendanceForm } from "./attendance-form";
import { cancelSessionAction } from "./actions";
import { ShareSessionButton } from "./share-session-button";

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

  const result = await getSessionDetailForUser(sessionId, user);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
          Back to dashboard
        </Link>
        <section className="mt-6 rounded-md border border-red-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-zinc-950">Session unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            You are not a member of the group that owns this session.
          </p>
        </section>
      </div>
    );
  }

  const session = result.session;
  const endTime = getSessionEnd(session.sessionDate, session.startTime).toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const canCancel = !session.canceled && (await canCancelSession(session.id, user));
  const attendanceTargets = await getAttendanceTargetsForUser(session.id, user);
  const canUpdateAttendance = session.active && attendanceTargets.length > 0;

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
            <p className="mt-1 text-sm text-zinc-600">Coach: {session.coachName ?? "Not assigned"}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <StateBadge state={session.state} />
            {session.canceled ? <CanceledBadge /> : null}
            <CapacityBadge state={session.capacityState} />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-2 lg:grid-cols-5">
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
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Capacity</dt>
            <dd className="mt-1 text-sm text-zinc-800">{session.capacity ?? "No limit"}</dd>
          </div>
        </dl>

        <p className="mt-5 text-sm text-zinc-600">
          Sessions are current for {sessionDurationMinutes} minutes after their start time. Attendance is open
          when a session is upcoming or current and not canceled.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ShareSessionButton sessionId={session.id} />

          {canCancel ? (
            <form action={cancelSessionAction}>
              <input type="hidden" name="sessionId" value={session.id} />
              <button
                type="submit"
                className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                Cancel session
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">Your Attendance</h2>
        <div className="mt-5 space-y-4">
          {canUpdateAttendance
            ? attendanceTargets.map((target) => {
                const current = session.members.find((member) => member.playerId === target.id);

                return (
                  <AttendanceForm
                    key={target.id}
                    sessionId={session.id}
                    playerId={target.id}
                    playerName={target.name}
                    note={current?.note ?? ""}
                  />
                );
              })
            : null}

          {!session.active ? (
            <p className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              Attendance updates are closed because this session is past or canceled.
            </p>
          ) : null}

          {session.active && attendanceTargets.length === 0 ? (
            <p className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              No linked player attendance target is available for your account on this session.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
          {session.canViewAllAttendance ? "Members and Attendance" : "Your Attendance Records"}
        </h2>
        {!session.canViewAllAttendance ? (
          <p className="mt-2 text-sm text-zinc-700">
            Coaches and managers can view all attendance records. You can see records connected to your account.
          </p>
        ) : null}
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

      <section className="mt-8">
        <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">Comments</h2>
        <div className="mt-5 space-y-3">
          {session.comments.length ? (
            session.comments.map((comment) => (
              <article key={comment.id} className="rounded-md border border-zinc-200 bg-white p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-zinc-950">{comment.authorName}</p>
                  <p className="text-xs text-zinc-500">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(comment.commentedAt)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-700">{comment.text}</p>
              </article>
            ))
          ) : (
            <p className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              No comments for this session yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
