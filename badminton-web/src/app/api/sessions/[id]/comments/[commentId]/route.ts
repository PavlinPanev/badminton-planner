import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { parseCommentBody, parseRequiredId } from "@/lib/api-validation";
import { updateSessionComment } from "@/services/sessions-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { id, commentId: rawCommentId } = await params;
  const body = await request.json().catch(() => null);
  const parsedSessionId = parseRequiredId(id, "Session id must be a number.");
  const parsedCommentId = parseRequiredId(rawCommentId, "Comment id must be a number.");

  if (!parsedSessionId.success || !parsedCommentId.success) {
    return jsonError("Session id and comment id must be numbers.", 400);
  }

  const parsedBody = parseCommentBody(body);

  if (!parsedBody.success) {
    return jsonError(parsedBody.error, 400);
  }

  const result = await updateSessionComment(
    auth.user,
    parsedSessionId.value,
    parsedCommentId.value,
    parsedBody.data.text,
  );

  if (result.status === "forbidden") {
    return jsonError("You are not a member of this session group.", 403);
  }

  if (result.status === "not-found") {
    return jsonError("Comment not found.", 404);
  }

  if (result.status === "forbidden-edit") {
    return jsonError("You can only edit comments you own or manage.", 403);
  }

  return Response.json({ data: result.data });
}
