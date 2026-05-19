import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { parseRequiredId } from "@/lib/api-validation";
import { getEventDetail } from "@/services/events-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const hasBearerToken = request.headers.get("authorization")?.toLowerCase().startsWith("bearer ");
  const auth = hasBearerToken ? await getApiUser(request) : null;

  if (auth?.error) {
    return auth.error;
  }

  const { id } = await params;
  const parsedId = parseRequiredId(id, "Event id must be a number.");

  if (!parsedId.success) {
    return jsonError(parsedId.error, 400);
  }

  const result = await getEventDetail(parsedId.value, auth?.user ?? null);

  if (result.status === "not-found") {
    return jsonError("Event not found.", 404);
  }

  return Response.json({ data: result.data });
}
