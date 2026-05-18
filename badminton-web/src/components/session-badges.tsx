import type { AttendanceStatus, CapacityState, SessionState } from "@/lib/session-status";

const stateStyles: Record<SessionState, string> = {
  upcoming: "bg-sky-50 text-sky-800",
  current: "bg-emerald-50 text-emerald-800",
  past: "bg-zinc-100 text-zinc-700",
};

const capacityStyles: Record<CapacityState, string> = {
  "under capacity": "bg-amber-50 text-amber-800",
  "full capacity": "bg-emerald-50 text-emerald-800",
  "over capacity": "bg-red-50 text-red-800",
};

const attendanceStyles: Record<AttendanceStatus, string> = {
  attending: "bg-emerald-50 text-emerald-800",
  absent: "bg-red-50 text-red-800",
  maybe: "bg-amber-50 text-amber-800",
  "no response": "bg-zinc-100 text-zinc-700",
};

export function StateBadge({ state }: { state: SessionState }) {
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${stateStyles[state]}`}>{state}</span>;
}

export function CapacityBadge({ state }: { state: CapacityState }) {
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${capacityStyles[state]}`}>{state}</span>;
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={`rounded px-2 py-1 text-xs font-semibold ${attendanceStyles[status]}`}>
      {status}
    </span>
  );
}

export function CanceledBadge() {
  return <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-800">canceled</span>;
}
