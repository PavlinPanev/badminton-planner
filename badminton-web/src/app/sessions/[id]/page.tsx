import Link from "next/link";
import { CalendarDays, Clock3, MapPin, UserRoundCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { AttendanceChips, CapacityMeter } from "@/components/dashboard-session-card";
import { AttendanceBadge, CanceledBadge, CapacityBadge, StateBadge } from "@/components/session-badges";
import { Card, EmptyState, SectionHeader } from "@/components/ui/surfaces";
import { canCancelSession, getAttendanceTargetsForUser, getSessionDetailForUser } from "@/lib/session-data";
import { formatSessionDate, formatSessionTime, getSessionEnd, sessionDurationMinutes } from "@/lib/session-status";
import { AttendanceForm } from "./attendance-form";
import { cancelSessionAction } from "./actions";
import { CommentsPanel } from "./comments-panel";
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
        <section className="mt-6 rounded-3xl border border-rose-200 bg-white p-6 shadow-lg">
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to dashboard
      </Link>

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.25)] sm:p-8">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%)] bg-[length:34px_34px] opacity-25" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-lime-100 ring-1 ring-white/30">
              Session details
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-normal sm:text-5xl">{session.groupTitle}</h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/90">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                {formatSessionDate(session.sessionDate)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="h-4 w-4" />
                {formatSessionTime(session.startTime)}-{endTime}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                {session.venueName}
              </span>
              <span className="inline-flex items-center gap-2">
                <UserRoundCheck aria-hidden="true" className="h-4 w-4" />
                Coach: {session.coachName ?? "Not assigned"}
              </span>
            </div>
            <p className="sr-only">
              {formatSessionDate(session.sessionDate)} at {formatSessionTime(session.startTime)}-{endTime}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <StateBadge state={session.state} />
            {session.canceled ? <CanceledBadge /> : null}
            <CapacityBadge state={session.capacityState} />
          </div>
        </div>

        <dl className="relative mt-8 grid gap-4 rounded-3xl bg-white/15 p-4 ring-1 ring-white/25 backdrop-blur sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl bg-white/15 p-4">
            <dt className="text-xs font-black uppercase tracking-wide text-lime-100">Attendance</dt>
            <dd className="mt-1 text-sm font-bold text-white">
              {session.attendanceSummary.attending} attending, {session.attendanceSummary.absent} absent
            </dd>
          </div>
          <div className="rounded-2xl bg-white/15 p-4">
            <dt className="text-xs font-black uppercase tracking-wide text-lime-100">Maybe</dt>
            <dd className="mt-1 text-sm font-bold text-white">{session.attendanceSummary.maybe}</dd>
          </div>
          <div className="rounded-2xl bg-white/15 p-4">
            <dt className="text-xs font-black uppercase tracking-wide text-lime-100">No response</dt>
            <dd className="mt-1 text-sm font-bold text-white">{session.attendanceSummary["no response"]}</dd>
          </div>
          <div className="rounded-2xl bg-white/15 p-4">
            <dt className="text-xs font-black uppercase tracking-wide text-lime-100">Comments</dt>
            <dd className="mt-1 text-sm font-bold text-white">{session.commentsCount}</dd>
          </div>
          <div className="rounded-2xl bg-white/15 p-4">
            <dt className="text-xs font-black uppercase tracking-wide text-lime-100">Capacity</dt>
            <dd className="mt-1 text-sm font-bold text-white">{session.capacity ?? "No limit"}</dd>
          </div>
        </dl>

        <p className="relative mt-5 text-sm font-semibold text-white/85">
          Sessions are current for {sessionDurationMinutes} minutes after their start time. Attendance is open
          when a session is upcoming or current and not canceled.
        </p>

        <div className="relative mt-6 flex flex-wrap gap-3">
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

      <section className="mt-10">
        <SectionHeader
          eyebrow="Your response"
          title="Your Attendance"
          description="Parents can update attendance for linked players while the session is active."
        />
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
            <EmptyState title="Attendance is closed" description="This session is past or canceled." />
          ) : null}

          {session.active && attendanceTargets.length === 0 ? (
            <EmptyState
              title="No attendance target"
              description="No linked player attendance target is available for your account on this session."
            />
          ) : null}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          eyebrow="Responses"
          title={session.canViewAllAttendance ? "Members and Attendance" : "Your Attendance Records"}
          description={
            session.canViewAllAttendance
              ? "Coaches and managers can scan the full group response list."
              : "Coaches and managers can view all attendance records. You can see records connected to your account."
          }
        />
        <Card className="mt-5 p-5">
          <div className="space-y-4">
            <AttendanceChips session={session} />
            <CapacityMeter session={session} />
          </div>
        </Card>
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-200 bg-gradient-to-r from-lime-50 to-sky-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-zinc-600 md:grid-cols-[1fr_120px_140px_1fr]">
            <span>Member</span>
            <span className="hidden md:block">Role</span>
            <span>Attendance</span>
            <span className="hidden md:block">Note</span>
          </div>
          {session.members.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-100 px-5 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_120px_140px_1fr]"
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

      <section className="mt-10">
        <SectionHeader eyebrow="Team notes" title="Comments" description="Coach notes and parent comments for this session." />
        <CommentsPanel
          sessionId={session.id}
          comments={session.comments.map((comment) => ({
            ...comment,
            commentedAt: comment.commentedAt.toISOString(),
          }))}
          currentUserId={user.id}
          canManageComments={session.manageable}
        />
      </section>
    </div>
  );
}
