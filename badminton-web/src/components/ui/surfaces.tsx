import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow ? (
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-black tracking-normal text-zinc-950 sm:text-3xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-zinc-700">{description}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2">
        <p className="text-base font-bold text-zinc-950">{title}</p>
        <p className="text-sm leading-6 text-zinc-700">{description}</p>
      </div>
    </Card>
  );
}
