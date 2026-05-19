"use server";

import { randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/auth/session";
import { db, groupInvitations, groupMembers, groups } from "@/db";
import { canManageGroup, canViewGroup } from "@/lib/group-data";

export type InviteActionState = {
  error?: string;
  invitePath?: string;
};

export async function createGroupInviteAction(
  _state: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Log in to create invite links." };
  }

  const groupId = Number(formData.get("groupId"));

  if (!Number.isInteger(groupId)) {
    return { error: "Choose a valid group." };
  }

  if (!(await canManageGroup(groupId, user))) {
    return { error: "Only group managers can create invite links." };
  }

  const code = randomBytes(24).toString("base64url");

  await db.insert(groupInvitations).values({
    groupId,
    inviteCode: code,
  });

  return {
    invitePath: `/groups/${groupId}/join?code=${encodeURIComponent(code)}`,
  };
}

export type AcceptInviteResult =
  | {
      status: "success";
      title: string;
      message: string;
      groupId: number;
      groupTitle: string;
    }
  | {
      status: "error";
      title: string;
      message: string;
    };

export async function acceptGroupInvite(groupId: number, code: string, userId: number): Promise<AcceptInviteResult> {
  if (!code.trim()) {
    return {
      status: "error",
      title: "Invalid link",
      message: "This invite link is missing its invite code.",
    };
  }

  const [group] = await db.select({ id: groups.id, title: groups.title }).from(groups).where(eq(groups.id, groupId)).limit(1);

  if (!group) {
    return {
      status: "error",
      title: "Invalid link",
      message: "This invite points to a group that does not exist.",
    };
  }

  const invitedUser = await db.query.users.findFirst({
    where: (users, { eq: userEq }) => userEq(users.id, userId),
  });

  if (!invitedUser) {
    return {
      status: "error",
      title: "Invalid user",
      message: "Your user account could not be verified.",
    };
  }

  if (await canViewGroup(groupId, invitedUser)) {
    return {
      status: "error",
      title: "Already a member",
      message: "You are already a member of this group.",
    };
  }

  const [invite] = await db
    .select({
      id: groupInvitations.id,
      usedAt: groupInvitations.usedAt,
    })
    .from(groupInvitations)
    .where(and(eq(groupInvitations.groupId, groupId), eq(groupInvitations.inviteCode, code)))
    .limit(1);

  if (!invite) {
    return {
      status: "error",
      title: "Invalid link",
      message: "This invite link is invalid.",
    };
  }

  if (invite.usedAt) {
    return {
      status: "error",
      title: "Link already used",
      message: "This invite link has already been used.",
    };
  }

  const [usedInvite] = await db
    .update(groupInvitations)
    .set({
      usedAt: new Date(),
      userId,
    })
    .where(and(eq(groupInvitations.id, invite.id), isNull(groupInvitations.usedAt)))
    .returning({ id: groupInvitations.id });

  if (!usedInvite) {
    return {
      status: "error",
      title: "Link already used",
      message: "This invite link has already been used.",
    };
  }

  await db.insert(groupMembers).values({
    groupId,
    userId,
    role: "parent",
  });

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);

  return {
    status: "success",
    title: "Welcome to the group",
    message: `You have joined ${group.title}.`,
    groupId,
    groupTitle: group.title,
  };
}
