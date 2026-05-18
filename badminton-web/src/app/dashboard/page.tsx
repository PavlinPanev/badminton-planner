import { CalendarCheck2, CircleHelp, Sparkles, Trophy } from "lucide-react";
import { gte } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { DashboardSessionCard } from "@/components/dashboard-session-card";
import { StatCard } from "@/components/stat-card";
import { EmptyState, SectionHeader } from "@/components/ui/surfaces";
import { db, events } from "@/db";
import { getDashboardSessions, type SessionCardData } from "@/lib/session-data";

function SessionSection({
  title,
  description,
  sessions,
  emptyText,
  archive = false,
}: {
  title: string;
  description: string;
  sessions: SessionCardData[];
  emptyText: string;
  archive?: boolean;
}) {
  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title={title} description={description} eyebrow={archive ? "Archive" : "This week"} />
        {sessions.length ? (
          <p className="rounded-full bg-white px-4 py-2 text-sm font-black text-zinc-700 shadow-sm ring-1 ring-zinc-950/5">
            {sessions.length} sessions
          </p>
        ) : null}
      </div>

      {sessions.length ? (
        <div className={archive ? "mt-6 grid gap-4 lg:grid-cols-2" : "mt-6 grid gap-5"}>
          {sessions.map((session) => (
            <DashboardSessionCard key={session.id} session={session} compact={archive} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState title="No sessions here yet" description={emptyText} />
        </div>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [{ activeSessions, archiveSessions }, eventRows] = await Promise.all([
    getDashboardSessions(user),
    db
      .select({ id: events.id })
      .from(events)
      .where(gte(events.eventDate, new Date())),
  ]);
  const attendingCount = activeSessions.reduce(
    (total, session) => total + session.attendanceSummary.attending,
    0,
  );
  const pendingResponses = activeSessions.reduce(
    (total, session) => total + session.attendanceSummary["no response"],
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-500 to-sky-500 p-6 text-white shadow-[0_24px_70px_rgba(20,184,166,0.28)] sm:p-8 lg:p-10">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%)] bg-[length:34px_34px] opacity-30" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
              Badminton club hub
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-normal sm:text-5xl">
              Ready for the next rally, {user.name.split(" ")[0]}?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
              Track group sessions, attendance, comments, and club events from one bright, mobile-friendly dashboard.
            </p>
          </div>
          <div className="rounded-3xl bg-white/16 p-5 ring-1 ring-white/30 backdrop-blur">
            <div className="grid aspect-square place-items-center rounded-3xl border border-white/25 bg-white/15">
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-lime-300 text-emerald-950 shadow-lg">
                  <Trophy aria-hidden="true" className="h-10 w-10" />
                </div>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-white/90">
                  Club energy
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-50">Sessions, players, events</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-5 grid gap-4 px-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming sessions"
          value={activeSessions.length}
          detail="Open or current"
          icon={CalendarCheck2}
          tone="emerald"
        />
        <StatCard
          title="Players attending"
          value={attendingCount}
          detail="Across active sessions"
          icon={Sparkles}
          tone="sky"
        />
        <StatCard
          title="Pending responses"
          value={pendingResponses}
          detail="No response yet"
          icon={CircleHelp}
          tone="violet"
        />
        <StatCard
          title="Events open"
          value={eventRows.length}
          detail="Public club events"
          icon={Trophy}
          tone="amber"
        />
      </section>

      <div className="mt-12 space-y-14">
        <SessionSection
          title="Active Sessions"
          description="Upcoming and current sessions that are open for attendance updates."
          sessions={activeSessions}
          emptyText="There are no active sessions for your groups."
        />
        <SessionSection
          title="Archive Sessions"
          description="Past sessions and canceled sessions for your groups, kept quieter for quick reference."
          sessions={archiveSessions}
          emptyText="There are no archived sessions for your groups."
          archive
        />
      </div>
    </div>
  );
}
