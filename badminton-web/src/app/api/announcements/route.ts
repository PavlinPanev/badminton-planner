import { NextRequest } from "next/server";

import { getApiUser, parsePage } from "@/auth/api";
import { listAnnouncements } from "@/services/announcements-service";

export async function GET(request: NextRequest) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { page, pageSize, offset } = parsePage(request);
  const payload = await listAnnouncements(auth.user, { page, pageSize, offset });
  return Response.json(payload);
}
