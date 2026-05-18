"use server";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db, users } from "@/db";
import { clearSessionCookie, setSessionCookie } from "./session";

export type AuthActionState = {
  error?: string;
};

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function readPassword(value: FormDataEntryValue | null) {
  return String(value ?? "");
}

function readSafeRedirect(value: FormDataEntryValue | null) {
  const redirectTo = String(value ?? "").trim();

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/";
  }

  if (redirectTo === "/login" || redirectTo === "/register") {
    return "/";
  }

  return redirectTo;
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(formData.get("email"));
  const password = readPassword(formData.get("password"));
  const redirectTo = readSafeRedirect(formData.get("redirectTo"));

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return { error: "The email or password is incorrect." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return { error: "The email or password is incorrect." };
  }

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect(redirectTo);
}

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = readPassword(formData.get("password"));

  if (!name || !email || !password) {
    return { error: "Enter your name, email, and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      role: "parent",
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    });

  await setSessionCookie(user);

  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
