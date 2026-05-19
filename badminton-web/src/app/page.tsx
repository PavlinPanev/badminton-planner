import Link from "next/link";
import { CalendarCheck2, CalendarDays, LayoutDashboard, Megaphone, ShieldCheck, UsersRound } from "lucide-react";

import { getCurrentUser } from "@/auth/session";

const highlights = [
  {
    title: "Live attendance",
    description: "Capture going, maybe, and absent responses before each session.",
    icon: CalendarCheck2,
  },
  {
    title: "Group operations",
    description: "Keep coaches, managers, parents, and players aligned in one place.",
    icon: UsersRound,
  },
  {
    title: "Announcements",
    description: "Share updates that instantly reach the mobile announcement feed.",
    icon: Megaphone,
  },
];

const workflows = [
  {
    title: "Set up the training groups",
    description: "Create groups, assign coaches, and onboard members or players.",
  },
  {
    title: "Publish session schedules",
    description: "Plan weekly sessions, manage venues, and keep capacity in check.",
  },
  {
    title: "Keep everyone informed",
    description: "Post announcements, track attendance, and monitor event registration.",
  },
];

const roles = [
  {
    title: "Managers",
    description: "Create groups, manage venues, and oversee the weekly schedule.",
  },
  {
    title: "Coaches",
    description: "Review attendance, coach notes, and session details at a glance.",
  },
  {
    title: "Parents",
    description: "Follow sessions, reply to attendance, and register for events.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-sky-600 to-violet-600 p-8 text-white shadow-[0_28px_70px_rgba(15,118,110,0.32)]">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%)] bg-[length:32px_32px] opacity-30" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
              Club planning made practical
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">
              Welcome to Badminton Planner
            </h1>
            <p className="mt-4 text-base leading-7 text-emerald-50">
              Plan training groups, publish upcoming sessions, track attendance, and keep coaches, managers,
              parents, and players working from the same schedule.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-emerald-800 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                  >
                    <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                    Open dashboard
                  </Link>
                  <Link
                    href="/groups"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/40 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30"
                  >
                    <UsersRound aria-hidden="true" className="h-4 w-4" />
                    View groups
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-950/80 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-950 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/40 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="rounded-3xl bg-white/12 p-5 ring-1 ring-white/20 backdrop-blur">
            <div className="rounded-3xl border border-white/25 bg-white/10 p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-100">At a glance</p>
              <div className="mt-4 space-y-3 text-sm font-semibold">
                <div className="flex items-center justify-between">
                  <span>Groups and memberships</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">role-based</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session cadence</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">weekly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Attendance updates</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">real time</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Club events</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">open</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                <item.icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-black text-zinc-950">{item.title}</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-black text-zinc-950">How it works</h2>
          </div>
          <div className="mt-5 space-y-4">
            {workflows.map((item, index) => (
              <div key={item.title} className="flex gap-4">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-black text-zinc-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-zinc-950/5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700">
              <CalendarDays aria-hidden="true" className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-black text-zinc-950">Role-based focus</h2>
          </div>
          <div className="mt-5 space-y-4">
            {roles.map((item) => (
              <div key={item.title} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-sm font-black text-zinc-950">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Quick navigation</p>
            <h2 className="mt-3 text-2xl font-black text-zinc-950 sm:text-3xl">Go straight to the work</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Use the core modules to keep schedules, attendance, and club logistics updated week after week.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 transition hover:bg-emerald-50"
            >
              Dashboard
              <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href={user ? "/groups" : "/login"}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 transition hover:bg-emerald-50"
            >
              Groups
              <UsersRound aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 transition hover:bg-emerald-50"
            >
              Events
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/venues"
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 transition hover:bg-emerald-50"
            >
              Venues
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
