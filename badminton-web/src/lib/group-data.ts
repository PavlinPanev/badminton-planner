import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { AuthUser } from "@/auth/token";
import { db, groupMembers, groups, players, sessions, users, venues } from "@/db";
import { getSessionState } from "./session-status";

export type UserGroupCardData = {
  id: number;
  title: string;
  description: string | null;
  level: string;
  minAge: number | null;
  maxAge: number | null;
  venueName: string;
  venueCity: string;
  memberCount: number;
  playerCount: number;
  sessionCount: number;
  roles: string[];
};

export type GroupDetailData = UserGroupCardData & {
  venueAddress: string;
  venueDescription: string | null;
  coaches: {
    id: number;
    name: string;
    email: string;
    role: string;
  }[];
  players: {
    id: number;
    name: string;
    birthYear: number;
    skillLevel: string;
    parentName: string;
  }[];
  members: {
    id: number;
    name: string;
    email: string;
    role: string;
  }[];
  sessions: {
    id: number;
    sessionDate: string;
    startTime: string;
    capacity: number | null;
    canceled: boolean;
    state: ReturnType<typeof getSessionState>;
    venueName: string;
    coachName: string | null;
  }[];
};

async function getOwnedPlayerIds(user: AuthUser) {
  const ownedPlayers = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.parentUserId, user.id));

  return ownedPlayers.map((player) => player.id);
}

async function getUserGroupMemberships(user: AuthUser) {
  const ownedPlayerIds = await getOwnedPlayerIds(user);
  const directMemberships = await db
    .select({
      groupId: groupMembers.groupId,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id));

  const playerMemberships = ownedPlayerIds.length
    ? await db
        .select({
          groupId: groupMembers.groupId,
          role: groupMembers.role,
        })
        .from(groupMembers)
        .where(inArray(groupMembers.playerId, ownedPlayerIds))
    : [];

  return [...directMemberships, ...playerMemberships];
}

async function getUserGroupIds(user: AuthUser) {
  const memberships = await getUserGroupMemberships(user);
  return Array.from(new Set(memberships.map((membership) => membership.groupId)));
}

function formatAgeRange(minAge: number | null, maxAge: number | null) {
  if (minAge && maxAge) {
    return `${minAge}-${maxAge}`;
  }

  if (minAge) {
    return `${minAge}+`;
  }

  if (maxAge) {
    return `up to ${maxAge}`;
  }

  return "all ages";
}

async function getGroupStats(groupId: number) {
  const [[{ total: memberCount }], [{ total: playerCount }], [{ total: sessionCount }]] = await Promise.all([
    db.select({ total: count() }).from(groupMembers).where(eq(groupMembers.groupId, groupId)),
    db
      .select({ total: count() })
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, "player"))),
    db.select({ total: count() }).from(sessions).where(eq(sessions.groupId, groupId)),
  ]);

  return {
    memberCount,
    playerCount,
    sessionCount,
  };
}

export function getGroupAgeLabel(group: { minAge: number | null; maxAge: number | null }) {
  return formatAgeRange(group.minAge, group.maxAge);
}

export async function getGroupsForUser(user: AuthUser): Promise<UserGroupCardData[]> {
  const memberships = await getUserGroupMemberships(user);
  const groupIds = Array.from(new Set(memberships.map((membership) => membership.groupId)));

  if (!groupIds.length) {
    return [];
  }

  const rows = await db
    .select({
      id: groups.id,
      title: groups.title,
      description: groups.description,
      level: groups.level,
      minAge: groups.minAge,
      maxAge: groups.maxAge,
      venueName: venues.name,
      venueCity: venues.city,
    })
    .from(groups)
    .innerJoin(venues, eq(groups.venueId, venues.id))
    .where(inArray(groups.id, groupIds))
    .orderBy(asc(groups.title));

  const stats = new Map(await Promise.all(rows.map(async (row) => [row.id, await getGroupStats(row.id)] as const)));
  const rolesByGroup = new Map<number, Set<string>>();

  for (const membership of memberships) {
    const roles = rolesByGroup.get(membership.groupId) ?? new Set<string>();
    roles.add(membership.role);
    rolesByGroup.set(membership.groupId, roles);
  }

  return rows.map((row) => ({
    ...row,
    ...(stats.get(row.id) ?? { memberCount: 0, playerCount: 0, sessionCount: 0 }),
    roles: Array.from(rolesByGroup.get(row.id) ?? []),
  }));
}

export async function getGroupDetailForUser(groupId: number, user: AuthUser) {
  const accessibleGroupIds = await getUserGroupIds(user);

  if (!accessibleGroupIds.includes(groupId)) {
    return { status: "forbidden" as const, group: null };
  }

  const [group] = await db
    .select({
      id: groups.id,
      title: groups.title,
      description: groups.description,
      level: groups.level,
      minAge: groups.minAge,
      maxAge: groups.maxAge,
      venueName: venues.name,
      venueCity: venues.city,
      venueAddress: venues.address,
      venueDescription: venues.description,
    })
    .from(groups)
    .innerJoin(venues, eq(groups.venueId, venues.id))
    .where(eq(groups.id, groupId))
    .limit(1);

  if (!group) {
    return { status: "not-found" as const, group: null };
  }

  const parentUsers = alias(users, "parent_users");
  const [memberRows, sessionRows, stats, userGroups] = await Promise.all([
    db
      .select({
        memberId: groupMembers.id,
        role: groupMembers.role,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        playerId: players.id,
        playerName: players.name,
        playerBirthYear: players.birthYear,
        playerSkillLevel: players.skillLevel,
        parentName: parentUsers.name,
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .leftJoin(players, eq(groupMembers.playerId, players.id))
      .leftJoin(parentUsers, eq(players.parentUserId, parentUsers.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(asc(groupMembers.role), asc(players.name), asc(users.name)),
    db
      .select({
        id: sessions.id,
        sessionDate: sessions.sessionDate,
        startTime: sessions.startTime,
        capacity: sessions.capacity,
        canceled: sessions.canceled,
        venueName: venues.name,
        coachName: users.name,
      })
      .from(sessions)
      .innerJoin(venues, eq(sessions.venueId, venues.id))
      .leftJoin(users, eq(sessions.coachUserId, users.id))
      .where(eq(sessions.groupId, groupId))
      .orderBy(desc(sessions.sessionDate), desc(sessions.startTime))
      .limit(12),
    getGroupStats(groupId),
    getGroupsForUser(user),
  ]);

  const directMembers = memberRows
    .filter((member) => member.userId)
    .map((member) => ({
      id: member.userId ?? member.memberId,
      name: member.userName ?? "Unknown member",
      email: member.userEmail ?? "",
      role: member.role,
    }));

  const coaches = directMembers.filter((member) => member.role === "coach" || member.role === "manager");
  const playerRows = memberRows
    .filter((member) => member.playerId)
    .map((member) => ({
      id: member.playerId ?? member.memberId,
      name: member.playerName ?? "Unknown player",
      birthYear: member.playerBirthYear ?? 0,
      skillLevel: member.playerSkillLevel ?? "beginner",
      parentName: member.parentName ?? "Linked parent",
    }));

  return {
    status: "ok" as const,
    group: {
      ...group,
      ...stats,
      roles: userGroups.find((userGroup) => userGroup.id === groupId)?.roles ?? [],
      coaches,
      players: playerRows,
      members: directMembers,
      sessions: sessionRows.map((session) => ({
        ...session,
        state: getSessionState(session.sessionDate, session.startTime),
      })),
    },
  };
}
