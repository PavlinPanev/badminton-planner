import { NextRequest } from "next/server";

import { getApiUser, parsePage } from "@/auth/api";
import { listEvents } from "@/services/events-service";

export async function GET(request: NextRequest) {
  const hasBearerToken = request.headers.get("authorization")?.toLowerCase().startsWith("bearer ");
  const auth = hasBearerToken ? await getApiUser(request) : null;

  if (auth?.error) {
    return auth.error;
  }

  const { page, pageSize, offset } = parsePage(request);
  const payload = await listEvents(auth?.user ?? null, { page, pageSize, offset });
  return Response.json(payload);
}
