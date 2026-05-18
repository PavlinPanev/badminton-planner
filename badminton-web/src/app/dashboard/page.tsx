import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { CanceledBadge, CapacityBadge, StateBadge } from "@/components/session-badges";
import { getDashboardSessions, type SessionCardData } from "@/lib/session-data";
import { formatSessionDate, formatSessionTime } from "@/lib/session-status";

function AttendanceSummary({ session }: { session: SessionCardData }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-700 sm:grid-cols-4">
      <span>Attending {session.attendanceSummary.attending}</span>
      <span>Absent {session.attendanceSummary.absent}</span>
      <span>Maybe {session.attendanceSummary.maybe}</span>
      <span>No response {session.attendanceSummary["no response"]}</span>
    </div>
  );
}

function SessionCard({ session }: { session: SessionCardData }) {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="block rounded-md border border-zinc-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-600">
            {formatSessionDate(session.sessionDate)} at {formatSessionTime(session.startTime)}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950">{session.groupTitle}</h3>
          <p className="mt-1 text-sm text-zinc-700">{session.venueName}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <StateBadge state={session.state} />
          {session.canceled ? <CanceledBadge /> : null}
          <CapacityBadge state={session.capacityState} />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <AttendanceSummary session={session} />
        <div className="flex flex-wrap gap-3 text-xs font-medium text-zinc-600">
          <span>{session.memberCount} members</span>
          <span>{session.commentsCount} comments</span>
          {session.capacity ? <span>Capacity {session.capacity}</span> : null}
        </div>
      </div>
    </Link>
  );
}

function SessionSection({
  title,
  description,
  sessions,
  emptyText,
}: {
  title: string;
  description: string;
  sessions: SessionCardData[];
  emptyText: string;
}) {
  return (
    <section>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">{title}</h2>
        <p className="text-sm leading-6 text-zinc-700">{description}</p>
      </div>

      {sessions.length ? (
        <div className="mt-5 grid gap-4">{sessions.map((session) => <SessionCard key={session.id} session={session} />)}</div>
      ) : (
        <p className="mt-5 rounded-md border border-zinc-200 bg-white p-5 text-sm text-zinc-700">{emptyText}</p>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { activeSessions, archiveSessions } = await getDashboardSessions(user);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-normal text-zinc-950">User Dashboard</h1>
        <p className="mt-3 text-base leading-7 text-zinc-700">
          Browse training sessions for your groups, including attendance responses and comments.
        </p>
      </div>

      <div className="space-y-12">
        <SessionSection
          title="Active Sessions"
          description="Upcoming and current sessions that are open for attendance updates."
          sessions={activeSessions}
          emptyText="There are no active sessions for your groups."
        />
        <SessionSection
          title="Archive Sessions"
          description="Past sessions and canceled sessions for your groups."
          sessions={archiveSessions}
          emptyText="There are no archived sessions for your groups."
        />
      </div>
    </div>
  );
}
