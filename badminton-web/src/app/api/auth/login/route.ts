import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { createSessionToken } from "@/auth/token";
import { db, users } from "@/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return Response.json({ error: { message: "Email and password are required." } }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return Response.json({ error: { message: "The email or password is incorrect." } }, { status: 401 });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return Response.json({ error: { message: "The email or password is incorrect." } }, { status: 401 });
  }

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
