import { NextRequest } from "next/server";

import { getApiUser, jsonError } from "@/auth/api";
import { getGroupAgeLabel, getGroupDetailPageForUser } from "@/lib/group-data";

export async function GET(
  request: NextRequest,
  context: {
    params: { id?: string };
  },
) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const groupId = Number(context.params.id);

  if (!Number.isInteger(groupId)) {
    return jsonError("Group id is invalid.", 400);
  }

  const pageSize = Math.min(Math.max(Number(request.nextUrl.searchParams.get("pageSize") ?? "6") || 6, 1), 12);
  const result = await getGroupDetailPageForUser(groupId, auth.user, {
    pageSize,
    playersPage: 1,
    membersPage: 1,
    announcementsPage: 1,
    sessionsPage: 1,
  });

  if (result.status === "forbidden") {
    return jsonError("You are not a member of this group.", 403);
  }

  if (result.status === "not-found" || !result.group) {
    return jsonError("Group not found.", 404);
  }

  const group = result.group;

  return Response.json({
    data: {
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
        address: group.venueAddress,
        description: group.venueDescription,
      },
      stats: {
        memberCount: group.memberCount,
        playerCount: group.playerCount,
        sessionCount: group.sessionCount,
      },
      roles: group.roles,
      canManage: group.canManage,
      currentUserRole: group.currentUserRole,
      canLeave: group.canLeave,
      canManageSessions: group.canManageSessions,
      canManageAnnouncements: group.canManageAnnouncements,
      coaches: group.coaches,
      sessions: group.sessions.map((session) => ({
        id: session.id,
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        capacity: session.capacity,
        canceled: session.canceled,
        state: session.state,
        venueName: session.venueName,
        coachName: session.coachName,
      })),
      announcements: group.announcements,
    },
  });
}
