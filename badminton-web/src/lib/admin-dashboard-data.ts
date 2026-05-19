import "server-only";

import { count, eq, sql } from "drizzle-orm";

import { db, events, groups, sessions, users, venues } from "@/db";
import { userRoles, type UserRole } from "./admin-user-data";

export type AdminDashboardData = {
  totals: {
    users: number;
    groups: number;
    sessions: number;
    events: number;
    venues: number;
    performanceSeedData: number;
  };
  roleCounts: Record<UserRole, number>;
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    [{ total: usersTotal }],
    [{ total: groupsTotal }],
    [{ total: sessionsTotal }],
    [{ total: eventsTotal }],
    [{ total: venuesTotal }],
    [{ total: performanceSeedTotal }],
    roleRows,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(groups),
    db.select({ total: count() }).from(sessions),
    db.select({ total: count() }).from(events),
    db.select({ total: count() }).from(venues),
    db.select({ total: count() }).from(users).where(sql`${users.email} like 'performance.user%@badminton.test'`),
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
      sessions: sessionsTotal,
      events: eventsTotal,
      venues: venuesTotal,
      performanceSeedData: performanceSeedTotal,
    },
    roleCounts: Object.fromEntries(roleRows) as Record<UserRole, number>,
  };
}
