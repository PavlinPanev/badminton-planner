import { NextRequest } from "next/server";

import { getApiUser, paginationMeta, parsePage } from "@/auth/api";
import { getGroupAgeLabel, getGroupsPageForUser } from "@/lib/group-data";

export async function GET(request: NextRequest) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { page, pageSize } = parsePage(request);
  const { groups, paging } = await getGroupsPageForUser(auth.user, { page, pageSize });

  return Response.json({
    data: groups.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      level: group.level,
      minAge: group.minAge,
      maxAge: group.maxAge,
      ageRangeLabel: getGroupAgeLabel(group),
      venue: {
        name: group.venueName,
        city: group.venueCity,
      },
      stats: {
        memberCount: group.memberCount,
        playerCount: group.playerCount,
        sessionCount: group.sessionCount,
      },
      roles: group.roles,
      canManage: group.canManage,
    })),
    paging: paginationMeta(page, pageSize, paging.total),
  });
}
