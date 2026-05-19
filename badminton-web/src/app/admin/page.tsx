import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, CalendarDays, MapPin, ShieldCheck, Trophy, UserCog, UsersRound } from "lucide-react";

import { getCurrentUser } from "@/auth/session";
import { Card, EmptyState, SectionHeader } from "@/components/ui/surfaces";
import { getAdminDashboardData } from "@/lib/admin-dashboard-data";
import { canManageUsers } from "@/lib/admin-user-data";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof UsersRound;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">{label}</p>
          <p className="mt-3 text-3xl font-black text-zinc-950">{value.toLocaleString()}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

function AdminLinkCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof UsersRound;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5 transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(16,185,129,0.18)]"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lime-200 to-emerald-300 text-emerald-950">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-xl font-black text-zinc-950 transition group-hover:text-emerald-800">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/admin");
  }

  if (!canManageUsers(currentUser)) {
    redirect("/dashboard");
  }

  const data = await getAdminDashboardData();
  const hasData = Object.values(data.totals).some((value) => value > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-sky-500 to-emerald-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%)] bg-[length:34px_34px] opacity-25" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
              Admin dashboard
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-normal sm:text-5xl">
              Global Operations
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
              Monitor platform-wide data and jump into the main management workflows.
            </p>
          </div>
          <div className="rounded-3xl bg-white/15 p-5 ring-1 ring-white/30 backdrop-blur">
            <ShieldCheck aria-hidden="true" className="h-16 w-16 text-lime-100" />
            <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-white/90">
              {currentUser.role}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          eyebrow="Overview"
          title="Platform Totals"
          description="Snapshot counts across the club planner database."
        />
        {hasData ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Users" value={data.totals.users} icon={UsersRound} />
            <StatCard label="Players" value={data.totals.players} icon={UserCog} />
            <StatCard label="Groups" value={data.totals.groups} icon={Trophy} />
            <StatCard label="Sessions" value={data.totals.sessions} icon={CalendarDays} />
            <StatCard label="Events" value={data.totals.events} icon={BarChart3} />
            <StatCard label="Venues" value={data.totals.venues} icon={MapPin} />
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState title="No platform data yet" description="Seed or create club data to populate admin metrics." />
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6">
          <SectionHeader
            eyebrow="Roles"
            title="User Mix"
            description="Global account roles available across the platform."
          />
          <div className="mt-5 space-y-3">
            {Object.entries(data.roleCounts).map(([role, total]) => (
              <div key={role} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                <span className="font-black capitalize text-zinc-800">{role}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-900 ring-1 ring-emerald-200">
                  {total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <SectionHeader
            eyebrow="Workflows"
            title="Admin Shortcuts"
            description="Use these routes for global and club-level management."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <AdminLinkCard
              href="/admin/users"
              title="User Roles"
              description="Review users and update global roles."
              icon={UserCog}
            />
            <AdminLinkCard href="/groups" title="Groups" description="Manage training groups and memberships." icon={UsersRound} />
            <AdminLinkCard href="/venues" title="Venues" description="Manage club halls and archived venues." icon={MapPin} />
            <AdminLinkCard href="/events" title="Events" description="Manage events and registrations." icon={CalendarDays} />
          </div>
        </div>
      </section>
    </div>
  );
}
