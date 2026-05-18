import {
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  Users,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { CanceledBadge, CapacityBadge, StateBadge } from "@/components/session-badges";
import type { SessionCardData } from "@/lib/session-data";
import { formatSessionDate, formatSessionTime } from "@/lib/session-status";

function pct(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(Math.round((value / total) * 100), 100);
}

function Metric({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
      <Icon aria-hidden="true" className="h-3.5 w-3.5 text-emerald-700" />
      {children}
    </span>
  );
}

export function AttendanceChips({ session }: { session: SessionCardData }) {
  const items = [
    ["Attending", session.attendanceSummary.attending, "bg-emerald-100 text-emerald-900"],
    ["Maybe", session.attendanceSummary.maybe, "bg-amber-100 text-amber-950"],
    ["Absent", session.attendanceSummary.absent, "bg-rose-100 text-rose-900"],
    ["No response", session.attendanceSummary["no response"], "bg-violet-100 text-violet-900"],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(([label, value, className]) => (
        <span key={label} className={`rounded-2xl px-3 py-2 text-xs font-black ${className}`}>
          {label} {value}
        </span>
      ))}
    </div>
  );
}

export function CapacityMeter({ session }: { session: SessionCardData }) {
  const capacityTotal = session.capacity ?? Math.max(session.memberCount, 1);
  const attendingPct = pct(session.attendanceSummary.attending, capacityTotal);
  const maybePct = pct(session.attendanceSummary.maybe, capacityTotal);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-600">
        <span>Attendance / capacity</span>
        <span>
          {session.attendanceSummary.attending}
          {session.capacity ? `/${session.capacity}` : " attending"}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
        <div className="flex h-full">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${attendingPct}%` }} />
          <div className="bg-gradient-to-r from-amber-300 to-yellow-400" style={{ width: `${maybePct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function DashboardSessionCard({ session, compact = false }: { session: SessionCardData; compact?: boolean }) {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group block overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(16,185,129,0.18)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
    >
      <div className="h-2 bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500" />
      <div className={compact ? "p-5" : "p-6"}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <StateBadge state={session.state} />
              {session.canceled ? <CanceledBadge /> : null}
              <CapacityBadge state={session.capacityState} />
            </div>
            <h3 className="text-xl font-black tracking-normal text-zinc-950 group-hover:text-emerald-800">
              {session.groupTitle}
            </h3>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <Metric icon={CalendarDays}>{formatSessionDate(session.sessionDate)}</Metric>
              <Metric icon={Clock3}>{formatSessionTime(session.startTime)}</Metric>
              <Metric icon={MapPin}>{session.venueName}</Metric>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-lime-100 px-3 py-2 text-xs font-black text-lime-950">
            <Trophy aria-hidden="true" className="h-4 w-4" />
            Match day
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <AttendanceChips session={session} />
          <CapacityMeter session={session} />
          <div className="flex flex-wrap gap-3 text-xs font-bold text-zinc-600">
            <Metric icon={Users}>{session.memberCount} members</Metric>
            <Metric icon={MessageCircle}>{session.commentsCount} comments</Metric>
            <Metric icon={Trophy}>{session.capacity ? `Capacity ${session.capacity}` : "Open capacity"}</Metric>
          </div>
        </div>
      </div>
    </Link>
  );
}
