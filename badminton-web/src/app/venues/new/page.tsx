import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { SectionHeader } from "@/components/ui/surfaces";
import { canManageVenues } from "@/lib/venue-data";
import { createVenueAction } from "../actions";
import { VenueForm } from "../venue-form";

export default async function NewVenuePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/venues/new");
  }

  if (!canManageVenues(user)) {
    redirect("/venues");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/venues" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to venues
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-emerald-600 via-sky-500 to-violet-500 p-6 text-white shadow-[0_24px_70px_rgba(59,130,246,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Manager tools
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Create Venue</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Add a club location for groups, sessions, and events.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader
          eyebrow="Venue setup"
          title="New Venue"
          description="Create the core venue record used by the planner."
        />
        <div className="mt-5">
          <VenueForm action={createVenueAction} submitLabel="Create venue" />
        </div>
      </section>
    </div>
  );
}
