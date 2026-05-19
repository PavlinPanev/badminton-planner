"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, users } from "@/db";
import { canManageUsers, countAdmins, isUserRole } from "@/lib/admin-user-data";

function readId(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isInteger(value) && value > 0 ? value : null;
}

function readPage(formData: FormData) {
  const value = Number(formData.get("page"));
  return Number.isInteger(value) && value > 1 ? value : 1;
}

function redirectToUsers(page: number, params: Record<string, string>): never {
  const searchParams = new URLSearchParams({ page: String(page), ...params });
  redirect(`/admin/users?${searchParams.toString()}`);
}

export async function updateUserRoleAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?next=/admin/users");
  }

  if (!canManageUsers(currentUser)) {
    redirect("/dashboard");
  }

  const page = readPage(formData);
  const userId = readId(formData, "userId");
  const role = formData.get("role");

  if (!userId || !isUserRole(role)) {
    redirectToUsers(page, { error: "invalid" });
  }

  const [targetUser] = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser) {
    redirectToUsers(page, { error: "not-found" });
  }

  if (targetUser.role === "admin" && role !== "admin" && (await countAdmins()) <= 1) {
    redirectToUsers(page, { error: "last-admin" });
  }

  await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
  redirectToUsers(page, { updated: String(userId) });
}
