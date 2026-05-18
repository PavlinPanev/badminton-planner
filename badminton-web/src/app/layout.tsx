import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Badminton Planner",
  description: "Club planning for badminton managers, coaches, parents, and players.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/venues", label: "Venues" },
  { href: "/events", label: "Events" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-zinc-950">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="text-lg font-semibold tracking-normal text-zinc-950">
                Badminton Planner
              </Link>

              <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-700 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <details className="relative md:hidden">
                <summary className="flex cursor-pointer list-none items-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 marker:hidden focus:outline-none focus:ring-2 focus:ring-emerald-600">
                  Menu
                </summary>
                <nav className="absolute right-0 z-10 mt-2 flex w-48 flex-col rounded-md border border-zinc-200 bg-white p-2 text-sm font-medium text-zinc-700 shadow-lg">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded px-3 py-2 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </details>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-zinc-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
              <p>Badminton Planner demo app</p>
              <p>Built for club managers, coaches, parents, and players.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
