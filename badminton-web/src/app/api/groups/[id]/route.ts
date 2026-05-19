import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { parsePageSizeParam, parseRequiredId } from "@/lib/api-validation";
import { getGroupDetail } from "@/services/groups-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const parsedId = parseRequiredId(id, "Group id is invalid.");

  if (!parsedId.success) {
    return jsonError(parsedId.error, 400);
  }

  const pageSize = parsePageSizeParam(request.nextUrl.searchParams);
  const result = await getGroupDetail(auth.user, parsedId.value, pageSize);

  if (result.status === "forbidden") {
    return jsonError("You are not a member of this group.", 403);
  }

  if (result.status === "not-found") {
    return jsonError("Group not found.", 404);
  }

  return Response.json({ data: result.data });
}
