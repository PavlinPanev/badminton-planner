import "server-only";

import { count, eq } from "drizzle-orm";

import { db, events, groups, players, sessions, users, venues } from "@/db";
import { userRoles, type UserRole } from "./admin-user-data";

export type AdminDashboardData = {
  totals: {
    users: number;
    groups: number;
    players: number;
    sessions: number;
    events: number;
    venues: number;
  };
  roleCounts: Record<UserRole, number>;
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    [{ total: usersTotal }],
    [{ total: groupsTotal }],
    [{ total: playersTotal }],
    [{ total: sessionsTotal }],
    [{ total: eventsTotal }],
    [{ total: venuesTotal }],
    roleRows,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(groups),
    db.select({ total: count() }).from(players),
    db.select({ total: count() }).from(sessions),
    db.select({ total: count() }).from(events),
    db.select({ total: count() }).from(venues),
    Promise.all(
      userRoles.map(async (role) => {
        const [{ total }] = await db.select({ total: count() }).from(users).where(eq(users.role, role));
        return [role, total] as const;
      }),
    ),
  ]);

  return {
    totals: {
      users: usersTotal,
      groups: groupsTotal,
      players: playersTotal,
      sessions: sessionsTotal,
      events: eventsTotal,
      venues: venuesTotal,
    },
    roleCounts: Object.fromEntries(roleRows) as Record<UserRole, number>,
  };
}
