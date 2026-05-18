import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Club planning made practical
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
          Welcome to Badminton Planner
        </h1>
        <p className="mt-5 text-lg leading-8 text-zinc-700">
          Plan training groups, publish upcoming sessions, track attendance, and
          keep coaches, managers, parents, and players working from the same
          schedule.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
        >
          Register
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Managers", "Create groups, publish sessions, and keep club operations visible."],
          ["Coaches", "See upcoming training, attendance notes, and group details quickly."],
          ["Parents", "Follow sessions, respond to attendance, and register for events."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-md border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
