import { CalendarCheck2, CircleHelp, Sparkles, Trophy } from "lucide-react";
import { count, gte } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { DashboardSessionCard } from "@/components/dashboard-session-card";
import { StatCard } from "@/components/stat-card";
import { EmptyState, SectionHeader } from "@/components/ui/surfaces";
import { db, events } from "@/db";
import { getDashboardSessions, type SessionCardData } from "@/lib/session-data";

const dashboardSessionPageSize = 6;

type DashboardSearchParams = {
  activePage?: string | string[];
  archivePage?: string | string[];
};

type SessionPaging = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function parsePositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return Math.max(Number(raw ?? "1") || 1, 1);
}

function dashboardPageHref(kind: "active" | "archive", page: number, current: DashboardSearchParams) {
  const params = new URLSearchParams();
  const activePage = kind === "active" ? page : parsePositivePage(current.activePage);
  const archivePage = kind === "archive" ? page : parsePositivePage(current.archivePage);

  if (activePage > 1) {
    params.set("activePage", String(activePage));
  }

  if (archivePage > 1) {
    params.set("archivePage", String(archivePage));
  }

  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}

function PaginationControls({
  kind,
  paging,
  searchParams,
}: {
  kind: "active" | "archive";
  paging: SessionPaging;
  searchParams: DashboardSearchParams;
}) {
  if (paging.totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(paging.page - 1, 1);
  const nextPage = Math.min(paging.page + 1, paging.totalPages);

  return (
    <nav
      aria-label={`${kind === "active" ? "Active" : "Archive"} sessions pagination`}
      className="mt-6 flex flex-col gap-3 rounded-3xl bg-white p-4 text-sm font-bold text-zinc-700 shadow-sm ring-1 ring-zinc-950/5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        Page {paging.page} of {paging.totalPages}
        <span className="font-semibold text-zinc-500"> · {paging.total} total</span>
      </p>
      <div className="flex gap-2">
        {paging.page > 1 ? (
          <Link
            href={dashboardPageHref(kind, previousPage, searchParams)}
            className="rounded-full border border-zinc-200 px-4 py-2 text-zinc-800 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-full border border-zinc-100 px-4 py-2 text-zinc-300">Previous</span>
        )}
        {paging.page < paging.totalPages ? (
          <Link
            href={dashboardPageHref(kind, nextPage, searchParams)}
            className="rounded-full bg-emerald-700 px-4 py-2 text-white transition hover:bg-emerald-800"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-full bg-zinc-100 px-4 py-2 text-zinc-300">Next</span>
        )}
      </div>
    </nav>
  );
}

function SessionSection({
  title,
  description,
  sessions,
  paging,
  pagingKind,
  searchParams,
  emptyText,
  archive = false,
}: {
  title: string;
  description: string;
  sessions: SessionCardData[];
  paging: SessionPaging;
  pagingKind: "active" | "archive";
  searchParams: DashboardSearchParams;
  emptyText: string;
  archive?: boolean;
}) {
  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title={title} description={description} eyebrow={archive ? "Archive" : "This week"} />
        {paging.total ? (
          <p className="rounded-full bg-white px-4 py-2 text-sm font-black text-zinc-700 shadow-sm ring-1 ring-zinc-950/5">
            {paging.total} sessions
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
      <PaginationControls kind={pagingKind} paging={paging} searchParams={searchParams} />
    </section>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const activePage = parsePositivePage(resolvedSearchParams.activePage);
  const archivePage = parsePositivePage(resolvedSearchParams.archivePage);
  const [{ activeSessions, archiveSessions, paging }, [{ total: openEventsCount }]] = await Promise.all([
    getDashboardSessions(user, {
      activePage,
      archivePage,
      pageSize: dashboardSessionPageSize,
    }),
    db
      .select({ total: count() })
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

  if (!paging) {
    throw new Error("Dashboard session paging is required.");
  }

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
          value={paging.active.total}
          detail="Open or current"
          icon={CalendarCheck2}
          tone="emerald"
        />
        <StatCard
          title="Players attending"
          value={attendingCount}
          detail="Visible active page"
          icon={Sparkles}
          tone="sky"
        />
        <StatCard
          title="Pending responses"
          value={pendingResponses}
          detail="Visible active page"
          icon={CircleHelp}
          tone="violet"
        />
        <StatCard
          title="Events open"
          value={openEventsCount}
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
          paging={paging.active}
          pagingKind="active"
          searchParams={resolvedSearchParams}
          emptyText="There are no active sessions for your groups."
        />
        <SessionSection
          title="Archive Sessions"
          description="Past sessions and canceled sessions for your groups, kept quieter for quick reference."
          sessions={archiveSessions}
          paging={paging.archive}
          pagingKind="archive"
          searchParams={resolvedSearchParams}
          emptyText="There are no archived sessions for your groups."
          archive
        />
      </div>
    </div>
  );
}
