"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({
  href,
  children,
  compact = false,
}: {
  href: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
        active
          ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md shadow-emerald-500/20"
          : "text-zinc-700 hover:bg-lime-100 hover:text-emerald-900"
      } ${compact ? "justify-start" : ""}`}
    >
      {children}
    </Link>
  );
}
