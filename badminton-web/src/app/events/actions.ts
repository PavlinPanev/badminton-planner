"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, events } from "@/db";
import { canManageEvents, getEventDeleteInfo } from "@/lib/event-data";
import { venueExistsActive } from "@/lib/venue-data";

export type EventActionState = {
  error?: string;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const number = Number(raw);
  return Number.isInteger(number) ? number : Number.NaN;
}

function parseEventForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 180);
  const description = String(formData.get("description") ?? "").trim().slice(0, 1200);
  const venueId = Number(formData.get("venueId"));
  const capacity = parseOptionalNumber(formData.get("capacity"));
  const rawEventDate = String(formData.get("eventDate") ?? "").trim();
  const canceled = formData.get("canceled") === "on";
  const eventDate = new Date(rawEventDate);

  if (!title) {
    return { error: "Event title is required." as const };
  }

  if (!rawEventDate || Number.isNaN(eventDate.getTime())) {
    return { error: "Choose a valid event date and time." as const };
  }

  if (!Number.isInteger(venueId)) {
    return { error: "Choose a valid venue." as const };
  }

  if (Number.isNaN(capacity)) {
    return { error: "Capacity must be a valid whole number." as const };
  }

  if (capacity !== null && capacity <= 0) {
    return { error: "Capacity must be greater than zero." as const };
  }

  return {
    values: {
      title,
      description: description || null,
      eventDate,
      venueId,
      capacity,
      canceled,
    },
  };
}

async function requireEventManager() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/events");
  }

  if (!canManageEvents(user)) {
    redirect("/events");
  }

  return user;
}

export async function createEventAction(_state: EventActionState, formData: FormData): Promise<EventActionState> {
  await requireEventManager();

  const parsed = parseEventForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (!(await venueExistsActive(parsed.values.venueId))) {
    return { error: "Choose an active venue." };
  }

  const [event] = await db
    .insert(events)
    .values({
      ...parsed.values,
      canceled: false,
    })
    .returning({ id: events.id });

  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function updateEventAction(_state: EventActionState, formData: FormData): Promise<EventActionState> {
  await requireEventManager();

  const eventId = Number(formData.get("eventId"));

  if (!Number.isInteger(eventId)) {
    return { error: "Choose a valid event." };
  }

  const parsed = parseEventForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (!(await venueExistsActive(parsed.values.venueId))) {
    return { error: "Choose an active venue." };
  }

  await db
    .update(events)
    .set({
      ...parsed.values,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId));

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

export async function deleteOrCancelEventAction(formData: FormData) {
  await requireEventManager();

  const eventId = Number(formData.get("eventId"));

  if (!Number.isInteger(eventId)) {
    redirect("/events");
  }

  const result = await getEventDeleteInfo(eventId);

  if (result.status === "not-found") {
    redirect("/events");
  }

  if (result.event.isUsed) {
    await db.update(events).set({ canceled: true, updatedAt: new Date() }).where(eq(events.id, eventId));
  } else {
    await db.delete(events).where(eq(events.id, eventId));
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  redirect("/events");
}
