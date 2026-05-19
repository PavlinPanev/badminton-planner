"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, venues } from "@/db";
import { canManageVenues, getVenueDeleteInfo } from "@/lib/venue-data";

export type VenueActionState = {
  error?: string;
};

function parseVenueForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 180);
  const address = String(formData.get("address") ?? "").trim().slice(0, 500);
  const city = String(formData.get("city") ?? "").trim().slice(0, 120);
  const description = String(formData.get("description") ?? "").trim().slice(0, 1200);

  if (!name) {
    return { error: "Venue name is required." as const };
  }

  if (!address) {
    return { error: "Venue address is required." as const };
  }

  if (!city) {
    return { error: "Venue city is required." as const };
  }

  return {
    values: {
      name,
      address,
      city,
      description: description || null,
    },
  };
}

async function requireVenueManager() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/venues");
  }

  if (!canManageVenues(user)) {
    redirect("/venues");
  }

  return user;
}

export async function createVenueAction(_state: VenueActionState, formData: FormData): Promise<VenueActionState> {
  await requireVenueManager();

  const parsed = parseVenueForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  await db.insert(venues).values(parsed.values);

  revalidatePath("/venues");
  redirect("/venues");
}

export async function updateVenueAction(_state: VenueActionState, formData: FormData): Promise<VenueActionState> {
  await requireVenueManager();

  const venueId = Number(formData.get("venueId"));

  if (!Number.isInteger(venueId)) {
    return { error: "Choose a valid venue." };
  }

  const parsed = parseVenueForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  await db
    .update(venues)
    .set({
      ...parsed.values,
      archivedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(venues.id, venueId));

  revalidatePath("/venues");
  redirect("/venues");
}

export async function deleteOrArchiveVenueAction(formData: FormData) {
  await requireVenueManager();

  const venueId = Number(formData.get("venueId"));

  if (!Number.isInteger(venueId)) {
    redirect("/venues");
  }

  const result = await getVenueDeleteInfo(venueId);

  if (result.status === "not-found") {
    redirect("/venues");
  }

  if (result.venue.isUsed) {
    await db.update(venues).set({ archivedAt: new Date(), updatedAt: new Date() }).where(eq(venues.id, venueId));
  } else {
    await db.delete(venues).where(eq(venues.id, venueId));
  }

  revalidatePath("/venues");
  redirect("/venues");
}
