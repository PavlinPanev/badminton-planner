import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { parseAttendanceBody, parseRequiredId } from "@/lib/api-validation";
import { updateAttendance } from "@/services/sessions-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsedId = parseRequiredId(id, "Session id must be a number.");

  if (!parsedId.success) {
    return jsonError(parsedId.error, 400);
  }

  const parsedBody = parseAttendanceBody(body);

  if (!parsedBody.success) {
    return jsonError(parsedBody.error, 400);
  }

  const result = await updateAttendance(
    auth.user,
    parsedId.value,
    parsedBody.data.playerId,
    parsedBody.data.status,
    parsedBody.data.note,
  );

  if (result.status === "forbidden") {
    return jsonError("You are not a member of this session group.", 403);
  }

  if (result.status === "closed") {
    return jsonError("Attendance is closed for this session.", 409);
  }

  if (result.status === "forbidden-player") {
    return jsonError("You can only update attendance for your linked players.", 403);
  }

  return Response.json({ data: result.data });
}
