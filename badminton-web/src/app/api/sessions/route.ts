import { NextRequest } from "next/server";

import { getApiUser, parsePage } from "@/auth/api";
import { getSessionsList } from "@/services/sessions-service";

export async function GET(request: NextRequest) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { page, pageSize } = parsePage(request);
  const payload = await getSessionsList(auth.user, { page, pageSize });
  return Response.json(payload);
}
