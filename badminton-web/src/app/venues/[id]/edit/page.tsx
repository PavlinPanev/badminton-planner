import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { SectionHeader } from "@/components/ui/surfaces";
import { canManageVenues, getEditableVenue } from "@/lib/venue-data";
import { updateVenueAction } from "../../actions";
import { VenueForm } from "../../venue-form";

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/venues");
  }

  if (!canManageVenues(user)) {
    redirect("/venues");
  }

  const { id } = await params;
  const venueId = Number(id);

  if (!Number.isInteger(venueId)) {
    notFound();
  }

  const result = await getEditableVenue(venueId);

  if (result.status === "not-found") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/venues" className="text-sm font-black text-emerald-700 hover:text-emerald-900">
        Back to venues
      </Link>

      <section className="mt-6 rounded-[2rem] bg-gradient-to-br from-sky-600 via-emerald-500 to-lime-400 p-6 text-white shadow-[0_24px_70px_rgba(16,185,129,0.24)] sm:p-8">
        <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-100 ring-1 ring-white/30">
          Manager tools
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">Edit {result.venue.name}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
          Update venue details or restore an archived venue by saving it.
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow="Venue setup" title="Edit Venue" description="Update the club location record." />
        <div className="mt-5">
          <VenueForm action={updateVenueAction} venue={result.venue} submitLabel="Save venue" />
        </div>
      </section>
    </div>
  );
}
