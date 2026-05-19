import { NextRequest } from "next/server";

import { getApiUser, parsePage } from "@/auth/api";
import { listGroups } from "@/services/groups-service";

export async function GET(request: NextRequest) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { page, pageSize } = parsePage(request);
  const payload = await listGroups(auth.user, { page, pageSize });
  return Response.json(payload);
}
