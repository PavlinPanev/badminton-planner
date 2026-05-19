import "server-only";

import type { AuthUser } from "@/auth/token";
import { paginationMeta } from "@/auth/api";
import { getGroupAgeLabel, getGroupDetailPageForUser, getGroupsPageForUser } from "@/lib/group-data";

export async function listGroups(user: AuthUser, options: { page: number; pageSize: number }) {
  const { groups, paging } = await getGroupsPageForUser(user, { page: options.page, pageSize: options.pageSize });

  return {
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
    paging: paginationMeta(options.page, options.pageSize, paging.total),
  };
}

export async function getGroupDetail(user: AuthUser, groupId: number, pageSize: number) {
  const result = await getGroupDetailPageForUser(groupId, user, {
    pageSize,
    playersPage: 1,
    membersPage: 1,
    announcementsPage: 1,
    sessionsPage: 1,
  });

  if (result.status === "forbidden") {
    return { status: "forbidden" as const };
  }

  if (result.status === "not-found" || !result.group) {
    return { status: "not-found" as const };
  }

  const group = result.group;

  return {
    status: "ok" as const,
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
  };
}
