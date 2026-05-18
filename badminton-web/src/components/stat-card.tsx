import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone: "emerald" | "sky" | "violet" | "amber";
}) {
  const tones = {
    emerald: {
      bar: "from-emerald-500 to-teal-500",
      icon: "bg-emerald-50 text-emerald-900",
    },
    sky: {
      bar: "from-sky-500 to-cyan-500",
      icon: "bg-sky-50 text-sky-900",
    },
    violet: {
      bar: "from-violet-500 to-fuchsia-500",
      icon: "bg-violet-50 text-violet-900",
    },
    amber: {
      bar: "from-amber-400 to-orange-400",
      icon: "bg-amber-50 text-amber-950",
    },
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className={`h-2 bg-gradient-to-r ${tones[tone].bar}`} />
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-bold text-zinc-600">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-normal text-zinc-950">{value}</p>
          <p className="mt-1 text-xs font-semibold text-zinc-500">{detail}</p>
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone].icon}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
