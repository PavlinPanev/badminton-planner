import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { parseEventRegistrationBody, parseRequiredId } from "@/lib/api-validation";
import { registerForEvent } from "@/services/events-service";

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

  const result = await registerForEvent(auth.user, parsedId.value, parsedBody.data.playerId);

  if (result.status === "not-found") {
    return jsonError("Event not found.", 404);
  }

  if (result.status === "canceled") {
    return jsonError("Event is canceled.", 409);
  }

  if (result.status === "forbidden-player") {
    return jsonError("You can only register your linked players.", 403);
  }

  return Response.json({ data: result.data });
}
