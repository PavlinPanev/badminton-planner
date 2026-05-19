import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { parseEventRegistrationBody, parseRequiredId } from "@/lib/api-validation";
import { cancelEventRegistration } from "@/services/events-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsedId = parseRequiredId(id, "Event id must be a number.");

  if (!parsedId.success) {
    return jsonError(parsedId.error, 400);
  }

  const parsedBody = parseEventRegistrationBody(body);

  if (!parsedBody.success) {
    return jsonError(parsedBody.error, 400);
  }

  const result = await cancelEventRegistration(auth.user, parsedId.value, parsedBody.data.playerId);

  if (result.status === "not-found") {
    return jsonError("Registration not found.", 404);
  }

  return Response.json({ data: result.data });
}
