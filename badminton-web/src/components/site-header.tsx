import Link from "next/link";
import { CalendarDays, Home, LayoutDashboard, LogIn, MapPin, ShieldCheck, UserPlus, UserRoundCog, UsersRound } from "lucide-react";

import { logoutAction } from "@/auth/actions";
import { getCurrentUser } from "@/auth/session";
import { NavLink } from "./nav-link";

const publicNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/venues", label: "Venues", icon: MapPin },
  { href: "/events", label: "Events", icon: CalendarDays },
];

function UserSummary({
  user,
  compact = false,
}: {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
  compact?: boolean;
}) {
  if (!user) {
    return (
      <div className={compact ? "flex flex-col gap-1" : "flex items-center gap-1"}>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-zinc-700 transition hover:bg-lime-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          <LogIn aria-hidden="true" className="h-4 w-4" />
          Login
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-2 text-sm font-black text-violet-900 transition hover:bg-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-600"
        >
          <UserPlus aria-hidden="true" className="h-4 w-4" />
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className={compact ? "flex flex-col gap-2 px-3 py-2" : "flex items-center gap-3"}>
      <div className={compact ? "" : "text-right"}>
        <p className="text-sm font-semibold text-zinc-950">{user.name}</p>
        <p className="text-xs text-zinc-600">{user.email}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-black text-zinc-800 shadow-sm transition hover:bg-rose-50 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          Logout
        </button>
      </form>
    </div>
  );
}

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-white/80 bg-white/85 backdrop-blur-xl">
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-normal text-zinc-950">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-lime-300 to-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/20">
            BP
          </span>
          <span>Badminton Planner</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-zinc-200/80 bg-white/80 p-1 text-sm font-medium text-zinc-700 shadow-sm md:flex">
          {user ? (
            <>
              <NavLink href="/dashboard">
                <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink href="/groups">
                <UsersRound aria-hidden="true" className="h-4 w-4" />
                Groups
              </NavLink>
              <NavLink href="/profile">
                <UserRoundCog aria-hidden="true" className="h-4 w-4" />
                Profile
              </NavLink>
              {user.role === "admin" ? (
                <NavLink href="/admin">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                  Admin
                </NavLink>
              ) : null}
            </>
          ) : null}
          {publicNavItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              <item.icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          <UserSummary user={user} />
        </nav>

        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-black text-zinc-800 shadow-sm marker:hidden focus:outline-none focus:ring-2 focus:ring-emerald-600">
            Menu
          </summary>
          <nav className="absolute right-0 z-10 mt-3 flex w-72 flex-col gap-1 rounded-3xl border border-white/80 bg-white p-3 text-sm font-medium text-zinc-700 shadow-2xl">
            {user ? (
              <>
                <NavLink href="/dashboard" compact>
                  <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                  Dashboard
                </NavLink>
                <NavLink href="/groups" compact>
                  <UsersRound aria-hidden="true" className="h-4 w-4" />
                  Groups
                </NavLink>
                <NavLink href="/profile" compact>
                  <UserRoundCog aria-hidden="true" className="h-4 w-4" />
                  Profile
                </NavLink>
                {user.role === "admin" ? (
                  <NavLink href="/admin" compact>
                    <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                    Admin
                  </NavLink>
                ) : null}
              </>
            ) : null}
            {publicNavItems.map((item) => (
              <NavLink key={item.href} href={item.href} compact>
                <item.icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 border-t border-zinc-200 pt-2">
              <UserSummary user={user} compact />
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
