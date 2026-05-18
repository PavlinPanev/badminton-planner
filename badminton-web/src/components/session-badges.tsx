import type { AttendanceStatus, CapacityState, SessionState } from "@/lib/session-status";

const stateStyles: Record<SessionState, string> = {
  upcoming: "bg-sky-100 text-sky-900 ring-sky-200",
  current: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  past: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

const capacityStyles: Record<CapacityState, string> = {
  "under capacity": "bg-amber-100 text-amber-950 ring-amber-200",
  "full capacity": "bg-emerald-100 text-emerald-900 ring-emerald-200",
  "over capacity": "bg-rose-100 text-rose-900 ring-rose-200",
};

const attendanceStyles: Record<AttendanceStatus, string> = {
  attending: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  absent: "bg-rose-100 text-rose-900 ring-rose-200",
  maybe: "bg-amber-100 text-amber-950 ring-amber-200",
  "no response": "bg-violet-100 text-violet-900 ring-violet-200",
};

export function StateBadge({ state }: { state: SessionState }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${stateStyles[state]}`}>{state}</span>;
}

export function CapacityBadge({ state }: { state: CapacityState }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${capacityStyles[state]}`}>{state}</span>;
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${attendanceStyles[status]}`}>
      {status}
    </span>
  );
}

export function CanceledBadge() {
  return <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-900 ring-1 ring-rose-200">canceled</span>;
}
