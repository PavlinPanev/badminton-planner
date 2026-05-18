import Link from "next/link";

import { logoutAction } from "@/auth/actions";
import { getCurrentUser } from "@/auth/session";

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/venues", label: "Venues" },
  { href: "/events", label: "Events" },
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
          className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-normal text-zinc-950">
          Badminton Planner
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-700 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              Dashboard
            </Link>
          ) : null}
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {item.label}
            </Link>
          ))}
          <UserSummary user={user} />
        </nav>

        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 marker:hidden focus:outline-none focus:ring-2 focus:ring-emerald-600">
            Menu
          </summary>
          <nav className="absolute right-0 z-10 mt-2 flex w-64 flex-col rounded-md border border-zinc-200 bg-white p-2 text-sm font-medium text-zinc-700 shadow-lg">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                Dashboard
              </Link>
            ) : null}
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {item.label}
              </Link>
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
