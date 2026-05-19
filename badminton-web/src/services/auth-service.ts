import "server-only";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { AuthResponse } from "badminton-shared";

import { createSessionToken } from "@/auth/token";
import { db, users } from "@/db";

export type AuthServiceResult =
  | {
      data: AuthResponse;
      error?: never;
    }
  | {
      data?: never;
      error: {
        status: number;
        message: string;
      };
    };

export async function loginWithPassword(email: string, password: string): Promise<AuthServiceResult> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return { error: { status: 401, message: "The email or password is incorrect." } };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return { error: { status: 401, message: "The email or password is incorrect." } };
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    data: {
      token,
      tokenType: "Bearer",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photoUrl: user.photoUrl,
      },
    },
  };
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthServiceResult> {
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return { error: { status: 400, message: "An account with this email already exists." } };
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
    .returning();

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    data: {
      token,
      tokenType: "Bearer",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photoUrl: user.photoUrl,
      },
    },
  };
}
