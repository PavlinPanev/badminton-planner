"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { db, sessions } from "@/db";
import { canCancelSession } from "@/lib/session-data";

export async function cancelSessionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessionId = Number(formData.get("sessionId"));

  if (!Number.isInteger(sessionId)) {
    return;
  }

  const allowed = await canCancelSession(sessionId, user);

  if (!allowed) {
    return;
  }

  await db
    .update(sessions)
    .set({
      canceled: true,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));

  revalidatePath("/dashboard");
  revalidatePath(`/sessions/${sessionId}`);
}
