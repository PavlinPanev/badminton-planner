"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, groupMembers, groups, venues } from "@/db";
import { canCreateGroups, canManageGroup } from "@/lib/group-data";

export type GroupActionState = {
  error?: string;
};

const groupLevels = ["beginner", "intermediate", "advanced", "competitive"] as const;

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const number = Number(raw);
  return Number.isInteger(number) ? number : Number.NaN;
}

async function venueExists(venueId: number) {
  const [venue] = await db.select({ id: venues.id }).from(venues).where(eq(venues.id, venueId)).limit(1);
  return Boolean(venue);
}

function parseGroupForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 180);
  const description = String(formData.get("description") ?? "").trim().slice(0, 1200);
  const level = String(formData.get("level") ?? "");
  const venueId = Number(formData.get("venueId"));
  const minAge = parseOptionalNumber(formData.get("minAge"));
  const maxAge = parseOptionalNumber(formData.get("maxAge"));

  if (!title) {
    return { error: "Group title is required." as const };
  }

  if (!groupLevels.includes(level as (typeof groupLevels)[number])) {
    return { error: "Choose a valid group level." as const };
  }

  if (!Number.isInteger(venueId)) {
    return { error: "Choose a valid venue." as const };
  }

  if (Number.isNaN(minAge) || Number.isNaN(maxAge)) {
    return { error: "Age limits must be whole numbers." as const };
  }

  if ((minAge !== null && minAge < 0) || (maxAge !== null && maxAge < 0)) {
    return { error: "Age limits cannot be negative." as const };
  }

  if (minAge !== null && maxAge !== null && minAge > maxAge) {
    return { error: "Minimum age cannot be higher than maximum age." as const };
  }

  return {
    values: {
      title,
      description: description || null,
      level: level as (typeof groupLevels)[number],
      venueId,
      minAge,
      maxAge,
    },
  };
}

export async function createGroupAction(_state: GroupActionState, formData: FormData): Promise<GroupActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups/new");
  }

  if (!canCreateGroups(user)) {
    return { error: "Only club managers can create groups." };
  }

  const parsed = parseGroupForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (!(await venueExists(parsed.values.venueId))) {
    return { error: "Choose an existing venue." };
  }

  const [group] = await db
    .insert(groups)
    .values(parsed.values)
    .returning({ id: groups.id });

  await db.insert(groupMembers).values({
    groupId: group.id,
    userId: user.id,
    role: "manager",
  });

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

export async function updateGroupAction(_state: GroupActionState, formData: FormData): Promise<GroupActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));

  if (!Number.isInteger(groupId)) {
    return { error: "Choose a valid group." };
  }

  if (!(await canManageGroup(groupId, user))) {
    return { error: "Only group managers can edit this group." };
  }

  const parsed = parseGroupForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (!(await venueExists(parsed.values.venueId))) {
    return { error: "Choose an existing venue." };
  }

  await db
    .update(groups)
    .set({
      ...parsed.values,
      updatedAt: new Date(),
    })
    .where(eq(groups.id, groupId));

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

export async function deleteGroupAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));

  if (!Number.isInteger(groupId)) {
    redirect("/groups");
  }

  if (!(await canManageGroup(groupId, user))) {
    redirect(`/groups/${groupId}`);
  }

  await db.delete(groups).where(eq(groups.id, groupId));

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect("/groups");
}

export async function leaveGroupAction(_state: GroupActionState, formData: FormData): Promise<GroupActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));

  if (!Number.isInteger(groupId)) {
    return { error: "Choose a valid group." };
  }

  const [membership] = await db
    .select({
      id: groupMembers.id,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)))
    .limit(1);

  if (!membership) {
    return { error: "You do not have a direct membership to leave in this group." };
  }

  if (membership.role === "manager") {
    const [{ total }] = await db
      .select({ total: count() })
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, "manager")));

    if (total <= 1) {
      return { error: "Add another manager before leaving this group." };
    }
  }

  await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)));

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect("/groups");
}
