import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { parseRequiredId } from "@/lib/api-validation";
import { getSessionDetail } from "@/services/sessions-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const parsedId = parseRequiredId(id, "Session id must be a number.");

  if (!parsedId.success) {
    return jsonError(parsedId.error, 400);
  }

  const result = await getSessionDetail(auth.user, parsedId.value);

  if (result.status === "not-found") {
    return jsonError("Session not found.", 404);
  }

  if (result.status === "forbidden") {
    return jsonError("You are not a member of this session group.", 403);
  }

  return Response.json({ data: result.data });
}
