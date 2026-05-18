import { SignJWT, jwtVerify } from "jose";

export const sessionCookieName = "badminton_session";
export const sessionDurationSeconds = 60 * 60 * 24 * 7;

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "manager" | "coach" | "parent";
};

export type SessionPayload = AuthUser & {
  sub: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required for authentication.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: AuthUser) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (
    typeof payload.sub !== "string" ||
    typeof payload.id !== "number" ||
    typeof payload.email !== "string" ||
    typeof payload.name !== "string" ||
    !["admin", "manager", "coach", "parent"].includes(String(payload.role))
  ) {
    return null;
  }

  return {
    sub: payload.sub,
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role as AuthUser["role"],
  } satisfies SessionPayload;
}
