import { NextRequest } from "next/server";

import { getApiUser, paginationMeta, parsePage } from "@/auth/api";
import { getDashboardSessions } from "@/lib/session-data";
import { formatSessionDate, formatSessionTime } from "@/lib/session-status";

export async function GET(request: NextRequest) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { page, pageSize } = parsePage(request);
  const { activeSessions, paging } = await getDashboardSessions(auth.user, {
    activePage: page,
    archivePage: 1,
    pageSize,
  });
  const activePaging = paging?.active ?? {
    page,
    pageSize,
    total: activeSessions.length,
    totalPages: Math.max(Math.ceil(activeSessions.length / pageSize), 1),
  };

  return Response.json({
    data: activeSessions.map((session) => ({
      id: session.id,
      group: { id: session.groupId, title: session.groupTitle },
      venue: { name: session.venueName },
      date: session.sessionDate,
      formattedDate: formatSessionDate(session.sessionDate),
      time: formatSessionTime(session.startTime),
      state: session.state,
      canceled: session.canceled,
      capacity: session.capacity,
      capacityState: session.capacityState,
      attendanceSummary: session.attendanceSummary,
      commentsCount: session.commentsCount,
    })),
    paging: paginationMeta(activePaging.page, activePaging.pageSize, activePaging.total),
  });
}
