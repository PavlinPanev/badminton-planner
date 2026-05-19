"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, groupMembers, players, users } from "@/db";
import { canManageGroup } from "@/lib/group-data";

async function requireGroupManager(groupId: number) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  if (!(await canManageGroup(groupId, user))) {
    redirect(`/groups/${groupId}`);
  }

  return user;
}

function readId(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isInteger(value) ? value : null;
}

async function revalidateGroupMembers(groupId: number) {
  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/members`);
}

async function countManagers(groupId: number) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, "manager")));

  return total;
}

export async function addPlayerToGroupAction(formData: FormData) {
  const groupId = readId(formData, "groupId");
  const playerId = readId(formData, "playerId");

  if (!groupId || !playerId) {
    redirect("/groups");
  }

  await requireGroupManager(groupId);

  const [player] = await db.select({ id: players.id }).from(players).where(eq(players.id, playerId)).limit(1);

  if (player) {
    await db
      .insert(groupMembers)
      .values({
        groupId,
        playerId,
        role: "player",
      })
      .onConflictDoNothing({
        target: [groupMembers.groupId, groupMembers.playerId],
      });
  }

  await revalidateGroupMembers(groupId);
  redirect(`/groups/${groupId}/members`);
}

export async function removePlayerFromGroupAction(formData: FormData) {
  const groupId = readId(formData, "groupId");
  const membershipId = readId(formData, "membershipId");

  if (!groupId || !membershipId) {
    redirect("/groups");
  }

  await requireGroupManager(groupId);
  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.id, membershipId), eq(groupMembers.groupId, groupId), eq(groupMembers.role, "player")));

  await revalidateGroupMembers(groupId);
  redirect(`/groups/${groupId}/members`);
}

export async function assignCoachAction(formData: FormData) {
  const groupId = readId(formData, "groupId");
  const userId = readId(formData, "userId");

  if (!groupId || !userId) {
    redirect("/groups");
  }

  await requireGroupManager(groupId);

  const [targetUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);

  if (targetUser) {
    const [membership] = await db
      .select({ id: groupMembers.id, role: groupMembers.role })
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1);

    if (!membership) {
      await db.insert(groupMembers).values({
        groupId,
        userId,
        role: "coach",
      });
    } else if (membership.role !== "manager") {
      await db.update(groupMembers).set({ role: "coach" }).where(eq(groupMembers.id, membership.id));
    }
  }

  await revalidateGroupMembers(groupId);
  redirect(`/groups/${groupId}/members`);
}

export async function removeUserMemberAction(formData: FormData) {
  const groupId = readId(formData, "groupId");
  const membershipId = readId(formData, "membershipId");

  if (!groupId || !membershipId) {
    redirect("/groups");
  }

  await requireGroupManager(groupId);

  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(and(eq(groupMembers.id, membershipId), eq(groupMembers.groupId, groupId)))
    .limit(1);

  if (membership?.role === "manager" && (await countManagers(groupId)) <= 1) {
    redirect(`/groups/${groupId}/members?error=last-manager`);
  }

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.id, membershipId), eq(groupMembers.groupId, groupId)));

  await revalidateGroupMembers(groupId);
  redirect(`/groups/${groupId}/members`);
}

export async function promoteManagerAction(formData: FormData) {
  const groupId = readId(formData, "groupId");
  const membershipId = readId(formData, "membershipId");

  if (!groupId || !membershipId) {
    redirect("/groups");
  }

  await requireGroupManager(groupId);
  await db
    .update(groupMembers)
    .set({ role: "manager" })
    .where(and(eq(groupMembers.id, membershipId), eq(groupMembers.groupId, groupId)));

  await revalidateGroupMembers(groupId);
  redirect(`/groups/${groupId}/members`);
}

export async function demoteManagerAction(formData: FormData) {
  const groupId = readId(formData, "groupId");
  const membershipId = readId(formData, "membershipId");

  if (!groupId || !membershipId) {
    redirect("/groups");
  }

  await requireGroupManager(groupId);

  if ((await countManagers(groupId)) <= 1) {
    redirect(`/groups/${groupId}/members?error=last-manager`);
  }

  await db
    .update(groupMembers)
    .set({ role: "coach" })
    .where(and(eq(groupMembers.id, membershipId), eq(groupMembers.groupId, groupId), eq(groupMembers.role, "manager")));

  await revalidateGroupMembers(groupId);
  redirect(`/groups/${groupId}/members`);
}
