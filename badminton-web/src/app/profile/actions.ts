"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, users } from "@/db";

function readName(formData: FormData) {
  return String(formData.get("name") ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 160);
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const name = readName(formData);

  if (name.length < 2) {
    redirect("/profile?error=name");
  }

  await db
    .update(users)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  redirect("/profile?updated=1");
}
