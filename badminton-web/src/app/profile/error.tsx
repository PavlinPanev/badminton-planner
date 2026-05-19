"use client";

import { AlertTriangle } from "lucide-react";

export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-rose-200 bg-white p-6 shadow-lg">
        <AlertTriangle aria-hidden="true" className="h-8 w-8 text-rose-600" />
        <h1 className="mt-4 text-2xl font-black text-zinc-950">Profile unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          The profile page could not load. Try again after a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        >
          Retry
        </button>
      </section>
    </div>
  );
}
