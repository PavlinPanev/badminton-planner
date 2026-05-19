import { NextRequest } from "next/server";

import { getApiUser, jsonError, parsePage } from "@/auth/api";
import { parseCommentBody, parseRequiredId } from "@/lib/api-validation";
import { createSessionComment, listSessionComments } from "@/services/sessions-service";

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

  const { page, pageSize } = parsePage(request);
  const result = await listSessionComments(auth.user, parsedId.value, { page, pageSize });

  if (result.status === "forbidden") {
    return jsonError("You are not a member of this session group.", 403);
  }

  return Response.json({ data: result.data, paging: result.paging });
}

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

  const parsedBody = parseCommentBody(body);

  if (!parsedBody.success) {
    return jsonError(parsedBody.error, 400);
  }

  const result = await createSessionComment(auth.user, parsedId.value, parsedBody.data.text);

  if (result.status === "forbidden") {
    return jsonError("You are not a member of this session group.", 403);
  }

  return Response.json({ data: result.data }, { status: 201 });
}
