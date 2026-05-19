import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { createSessionToken } from "@/auth/token";
import { db, users } from "@/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");

  if (!name || !email || !password) {
    return Response.json({ error: { message: "Name, email, and password are required." } }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: { message: "Password must be at least 6 characters." } }, { status: 400 });
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return Response.json({ error: { message: "An account with this email already exists." } }, { status: 400 });
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

  return Response.json({
    token,
    tokenType: "Bearer",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl,
    },
  });
}
