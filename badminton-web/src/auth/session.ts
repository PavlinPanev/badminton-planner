import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import {
  AuthUser,
  createSessionToken,
  sessionCookieName,
  sessionDurationSeconds,
  verifySessionToken,
} from "./token";

const secureCookie = process.env.NODE_ENV === "production";

export async function setSessionCookie(user: AuthUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: sessionDurationSeconds,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 0,
  });
}

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token).catch(() => null);

  if (!session) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  return user ?? null;
});
