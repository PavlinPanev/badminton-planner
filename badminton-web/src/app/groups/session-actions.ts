"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, groupMembers, sessions } from "@/db";
import { canManageGroupSessions } from "@/lib/group-data";
import { venueExistsActive } from "@/lib/venue-data";

export type SessionActionState = {
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

async function coachBelongsToGroup(groupId: number, coachUserId: number) {
  const [coach] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, coachUserId),
        inArray(groupMembers.role, ["coach", "manager"]),
      ),
    )
    .limit(1);

  return Boolean(coach);
}

function parseSessionForm(formData: FormData) {
  const sessionDate = String(formData.get("sessionDate") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const venueId = Number(formData.get("venueId"));
  const coachUserId = parseOptionalNumber(formData.get("coachUserId"));
  const capacity = parseOptionalNumber(formData.get("capacity"));
  const canceled = formData.get("canceled") === "on";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
    return { error: "Choose a valid session date." as const };
  }

  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    return { error: "Choose a valid start time." as const };
  }

  if (!Number.isInteger(venueId)) {
    return { error: "Choose a valid venue." as const };
  }

  if (Number.isNaN(coachUserId) || Number.isNaN(capacity)) {
    return { error: "Coach and capacity values must be valid." as const };
  }

  if (capacity !== null && capacity <= 0) {
    return { error: "Capacity must be greater than zero." as const };
  }

  return {
    values: {
      sessionDate,
      startTime,
      venueId,
      coachUserId,
      capacity,
      canceled,
    },
  };
}

export async function createSessionAction(
  _state: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));

  if (!Number.isInteger(groupId)) {
    return { error: "Choose a valid group." };
  }

  if (!(await canManageGroupSessions(groupId, user))) {
    return { error: "Only group coaches, managers, or admins can create sessions." };
  }

  const parsed = parseSessionForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (!(await venueExistsActive(parsed.values.venueId))) {
    return { error: "Choose an existing venue." };
  }

  if (parsed.values.coachUserId !== null && !(await coachBelongsToGroup(groupId, parsed.values.coachUserId))) {
    return { error: "Choose a coach or manager from this group." };
  }

  const [session] = await db
    .insert(sessions)
    .values({
      ...parsed.values,
      canceled: false,
      groupId,
    })
    .returning({ id: sessions.id });

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect(`/sessions/${session.id}`);
}

export async function updateSessionAction(
  _state: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));
  const sessionId = Number(formData.get("sessionId"));

  if (!Number.isInteger(groupId) || !Number.isInteger(sessionId)) {
    return { error: "Choose a valid session." };
  }

  if (!(await canManageGroupSessions(groupId, user))) {
    return { error: "Only group coaches, managers, or admins can edit sessions." };
  }

  const parsed = parseSessionForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (!(await venueExistsActive(parsed.values.venueId))) {
    return { error: "Choose an existing venue." };
  }

  if (parsed.values.coachUserId !== null && !(await coachBelongsToGroup(groupId, parsed.values.coachUserId))) {
    return { error: "Choose a coach or manager from this group." };
  }

  await db
    .update(sessions)
    .set({
      ...parsed.values,
      updatedAt: new Date(),
    })
    .where(and(eq(sessions.id, sessionId), eq(sessions.groupId, groupId)));

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/sessions/${sessionId}`);
  redirect(`/groups/${groupId}`);
}

export async function deleteSessionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));
  const sessionId = Number(formData.get("sessionId"));

  if (!Number.isInteger(groupId) || !Number.isInteger(sessionId)) {
    redirect("/groups");
  }

  if (!(await canManageGroupSessions(groupId, user))) {
    redirect(`/groups/${groupId}`);
  }

  await db.delete(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.groupId, groupId)));

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}
