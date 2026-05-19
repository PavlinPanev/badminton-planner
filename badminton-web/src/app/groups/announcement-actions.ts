"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, groupAnnouncements } from "@/db";
import { canManageGroupAnnouncements } from "@/lib/group-data";

export type AnnouncementActionState = {
  error?: string;
};

function parseAnnouncementForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  const content = String(formData.get("content") ?? "").trim().slice(0, 4000);

  if (!title) {
    return { error: "Announcement title is required." as const };
  }

  if (!content) {
    return { error: "Announcement content is required." as const };
  }

  return {
    values: {
      title,
      content,
    },
  };
}

export async function createAnnouncementAction(
  _state: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));

  if (!Number.isInteger(groupId)) {
    return { error: "Choose a valid group." };
  }

  if (!(await canManageGroupAnnouncements(groupId, user))) {
    return { error: "Only group coaches, managers, or admins can post announcements." };
  }

  const parsed = parseAnnouncementForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  await db.insert(groupAnnouncements).values({
    groupId,
    authorId: user.id,
    ...parsed.values,
  });

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

export async function updateAnnouncementAction(
  _state: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));
  const announcementId = Number(formData.get("announcementId"));

  if (!Number.isInteger(groupId) || !Number.isInteger(announcementId)) {
    return { error: "Choose a valid announcement." };
  }

  if (!(await canManageGroupAnnouncements(groupId, user))) {
    return { error: "Only group coaches, managers, or admins can edit announcements." };
  }

  const parsed = parseAnnouncementForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  await db
    .update(groupAnnouncements)
    .set({
      ...parsed.values,
      updatedAt: new Date(),
    })
    .where(and(eq(groupAnnouncements.id, announcementId), eq(groupAnnouncements.groupId, groupId)));

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

export async function deleteAnnouncementAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/groups");
  }

  const groupId = Number(formData.get("groupId"));
  const announcementId = Number(formData.get("announcementId"));

  if (!Number.isInteger(groupId) || !Number.isInteger(announcementId)) {
    redirect("/groups");
  }

  if (!(await canManageGroupAnnouncements(groupId, user))) {
    redirect(`/groups/${groupId}`);
  }

  await db
    .delete(groupAnnouncements)
    .where(and(eq(groupAnnouncements.id, announcementId), eq(groupAnnouncements.groupId, groupId)));

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}
