import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db, users } from "@/db";
import { parsePaginationParams } from "@/lib/api-validation";
import { paginationMeta } from "@/lib/pagination";
import { verifySessionToken } from "./token";

export type ApiAuthResult =
  | {
      user: {
        id: number;
        email: string;
        name: string;
        role: "admin" | "manager" | "coach" | "parent";
      };
      error?: never;
    }
  | {
      user?: never;
      error: Response;
    };

export function jsonError(message: string, status: number) {
  return Response.json({ error: { message } }, { status });
}

export async function getApiUser(request: NextRequest): Promise<ApiAuthResult> {
  const authorization = request.headers.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return { error: jsonError("Bearer token is required.", 401) };
  }

  const session = await verifySessionToken(token).catch(() => null);

  if (!session) {
    return { error: jsonError("Bearer token is invalid or expired.", 401) };
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

  if (!user) {
    return { error: jsonError("User no longer exists.", 401) };
  }

  return { user };
}

export function parsePage(request: NextRequest) {
  return parsePaginationParams(request.nextUrl.searchParams);
}
export { paginationMeta };
