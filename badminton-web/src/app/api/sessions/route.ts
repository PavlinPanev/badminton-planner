import { NextRequest } from "next/server";

import { getApiUser, parsePage } from "@/auth/api";
import { getDashboardSessions } from "@/lib/session-data";
import { formatSessionDate, formatSessionTime } from "@/lib/session-status";

export async function GET(request: NextRequest) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { page, pageSize, offset } = parsePage(request);
  const { activeSessions } = await getDashboardSessions(auth.user);
  const pageItems = activeSessions.slice(offset, offset + pageSize);

  return Response.json({
    data: pageItems.map((session) => ({
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
    paging: {
      page,
      pageSize,
      total: activeSessions.length,
      hasMore: offset + pageSize < activeSessions.length,
    },
  });
}
