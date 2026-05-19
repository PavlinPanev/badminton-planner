import { and, asc, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { AuthUser } from "@/auth/token";
import { db, groupAnnouncements, groupMembers, groups, players, sessions, users, venues } from "@/db";
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
  canManage: boolean;
};

export type UserGroupListResult = {
  groups: UserGroupCardData[];
  paging: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type GroupDetailData = UserGroupCardData & {
  venueAddress: string;
  venueDescription: string | null;
  currentUserRole: string | null;
  canLeave: boolean;
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
  canManageSessions: boolean;
  announcements: GroupAnnouncementListItem[];
  canManageAnnouncements: boolean;
};

export type GroupAnnouncementListItem = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorRole: string;
};

export type GroupFormData = {
  id: number;
  title: string;
  description: string | null;
  level: string;
  minAge: number | null;
  maxAge: number | null;
  venueId: number;
};

export type VenueOption = {
  id: number;
  name: string;
  city: string;
};

export type CoachOption = {
  id: number;
  name: string;
  email: string;
};

export type SessionFormData = {
  id: number;
  groupId: number;
  sessionDate: string;
  startTime: string;
  venueId: number;
  coachUserId: number | null;
  capacity: number | null;
  canceled: boolean;
};

export type SessionFormContext = {
  group: {
    id: number;
    title: string;
  };
  venues: VenueOption[];
  coaches: CoachOption[];
};

export type AnnouncementFormData = {
  id: number;
  title: string;
  content: string;
};

export type AnnouncementFormContext = {
  group: {
    id: number;
    title: string;
  };
};

export type GroupMembersManagementData = {
  group: {
    id: number;
    title: string;
  };
  members: {
    membershipId: number;
    userId: number;
    name: string;
    email: string;
    role: string;
  }[];
  playerMembers: {
    membershipId: number;
    playerId: number;
    name: string;
    birthYear: number;
    skillLevel: string;
    parentName: string;
  }[];
  availablePlayers: {
    id: number;
    name: string;
    birthYear: number;
    skillLevel: string;
    parentName: string;
  }[];
  availableCoaches: {
    id: number;
    name: string;
    email: string;
    role: string;
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
    canManage: rolesByGroup.get(row.id)?.has("manager") ?? false,
  }));
}

function normalizePage(value: number | undefined) {
  return Math.max(Number(value) || 1, 1);
}

function normalizePageSize(value: number | undefined) {
  return Math.min(Math.max(Number(value) || 12, 1), 48);
}

export async function getGroupsPageForUser(
  user: AuthUser,
  options?: { page?: number; pageSize?: number },
): Promise<UserGroupListResult> {
  const memberships = await getUserGroupMemberships(user);
  const groupIds = Array.from(new Set(memberships.map((membership) => membership.groupId)));
  const page = normalizePage(options?.page);
  const pageSize = normalizePageSize(options?.pageSize);
  const offset = (page - 1) * pageSize;

  if (!groupIds.length) {
    return {
      groups: [],
      paging: {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
      },
    };
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
    .orderBy(asc(groups.title))
    .limit(pageSize)
    .offset(offset);

  const stats = new Map(await Promise.all(rows.map(async (row) => [row.id, await getGroupStats(row.id)] as const)));
  const rolesByGroup = new Map<number, Set<string>>();

  for (const membership of memberships) {
    const roles = rolesByGroup.get(membership.groupId) ?? new Set<string>();
    roles.add(membership.role);
    rolesByGroup.set(membership.groupId, roles);
  }

  return {
    groups: rows.map((row) => ({
      ...row,
      ...(stats.get(row.id) ?? { memberCount: 0, playerCount: 0, sessionCount: 0 }),
      roles: Array.from(rolesByGroup.get(row.id) ?? []),
      canManage: rolesByGroup.get(row.id)?.has("manager") ?? false,
    })),
    paging: {
      page,
      pageSize,
      total: groupIds.length,
      totalPages: Math.max(Math.ceil(groupIds.length / pageSize), 1),
    },
  };
}

export async function canManageGroup(groupId: number, user: AuthUser) {
  const [membership] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id), eq(groupMembers.role, "manager")))
    .limit(1);

  return Boolean(membership);
}

export async function canManageGroupSessions(groupId: number, user: AuthUser) {
  if (user.role === "admin") {
    return true;
  }

  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)))
    .limit(1);

  return membership?.role === "manager" || membership?.role === "coach";
}

export async function canManageGroupAnnouncements(groupId: number, user: AuthUser) {
  if (user.role === "admin") {
    return true;
  }

  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)))
    .limit(1);

  return membership?.role === "manager" || membership?.role === "coach";
}

export async function canViewGroup(groupId: number, user: AuthUser) {
  const accessibleGroupIds = await getUserGroupIds(user);
  return accessibleGroupIds.includes(groupId);
}

export function canCreateGroups(user: AuthUser) {
  return user.role === "manager" || user.role === "admin";
}

export async function getVenueOptions(): Promise<VenueOption[]> {
  return db
    .select({
      id: venues.id,
      name: venues.name,
      city: venues.city,
    })
    .from(venues)
    .where(isNull(venues.archivedAt))
    .orderBy(asc(venues.city), asc(venues.name));
}

async function getCoachOptions(groupId: number): Promise<CoachOption[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(and(eq(groupMembers.groupId, groupId), inArray(groupMembers.role, ["coach", "manager"])))
    .orderBy(asc(users.name));

  return rows;
}

export async function getSessionFormContextForUser(groupId: number, user: AuthUser) {
  const [group] = await db.select({ id: groups.id, title: groups.title }).from(groups).where(eq(groups.id, groupId)).limit(1);

  if (!group) {
    return { status: "not-found" as const, context: null };
  }

  if (!(await canManageGroupSessions(groupId, user))) {
    return { status: "forbidden" as const, context: null };
  }

  const [venueOptions, coachOptions] = await Promise.all([getVenueOptions(), getCoachOptions(groupId)]);

  return {
    status: "ok" as const,
    context: {
      group,
      venues: venueOptions,
      coaches: coachOptions,
    } satisfies SessionFormContext,
  };
}

export async function getAnnouncementFormContextForUser(groupId: number, user: AuthUser) {
  const [group] = await db.select({ id: groups.id, title: groups.title }).from(groups).where(eq(groups.id, groupId)).limit(1);

  if (!group) {
    return { status: "not-found" as const, context: null };
  }

  if (!(await canManageGroupAnnouncements(groupId, user))) {
    return { status: "forbidden" as const, context: null };
  }

  return {
    status: "ok" as const,
    context: {
      group,
    } satisfies AnnouncementFormContext,
  };
}

export async function getEditableSessionForUser(groupId: number, sessionId: number, user: AuthUser) {
  const [session] = await db
    .select({
      id: sessions.id,
      groupId: sessions.groupId,
      sessionDate: sessions.sessionDate,
      startTime: sessions.startTime,
      venueId: sessions.venueId,
      coachUserId: sessions.coachUserId,
      capacity: sessions.capacity,
      canceled: sessions.canceled,
    })
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.groupId, groupId)))
    .limit(1);

  if (!session) {
    return { status: "not-found" as const, session: null };
  }

  if (!(await canManageGroupSessions(groupId, user))) {
    return { status: "forbidden" as const, session: null };
  }

  return {
    status: "ok" as const,
    session,
  };
}

export async function getEditableAnnouncementForUser(groupId: number, announcementId: number, user: AuthUser) {
  const [announcement] = await db
    .select({
      id: groupAnnouncements.id,
      title: groupAnnouncements.title,
      content: groupAnnouncements.content,
      groupId: groupAnnouncements.groupId,
    })
    .from(groupAnnouncements)
    .where(and(eq(groupAnnouncements.id, announcementId), eq(groupAnnouncements.groupId, groupId)))
    .limit(1);

  if (!announcement) {
    return { status: "not-found" as const, announcement: null };
  }

  if (!(await canManageGroupAnnouncements(groupId, user))) {
    return { status: "forbidden" as const, announcement: null };
  }

  return {
    status: "ok" as const,
    announcement: {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
    } satisfies AnnouncementFormData,
  };
}

export async function getEditableGroupForUser(groupId: number, user: AuthUser) {
  const [group] = await db
    .select({
      id: groups.id,
      title: groups.title,
      description: groups.description,
      level: groups.level,
      minAge: groups.minAge,
      maxAge: groups.maxAge,
      venueId: groups.venueId,
    })
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);

  if (!group) {
    return { status: "not-found" as const, group: null };
  }

  const allowed = await canManageGroup(groupId, user);

  if (!allowed) {
    return { status: "forbidden" as const, group: null };
  }

  return {
    status: "ok" as const,
    group,
  };
}

export async function getGroupMembersManagementForUser(groupId: number, user: AuthUser) {
  const [group] = await db.select({ id: groups.id, title: groups.title }).from(groups).where(eq(groups.id, groupId)).limit(1);

  if (!group) {
    return { status: "not-found" as const, data: null };
  }

  if (!(await canManageGroup(groupId, user))) {
    return { status: "forbidden" as const, data: null };
  }

  const parentUsers = alias(users, "parent_users");
  const [memberRows, playerRows, allPlayers, coachUsers] = await Promise.all([
    db
      .select({
        membershipId: groupMembers.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(asc(groupMembers.role), asc(users.name)),
    db
      .select({
        membershipId: groupMembers.id,
        playerId: players.id,
        name: players.name,
        birthYear: players.birthYear,
        skillLevel: players.skillLevel,
        parentName: parentUsers.name,
      })
      .from(groupMembers)
      .innerJoin(players, eq(groupMembers.playerId, players.id))
      .innerJoin(parentUsers, eq(players.parentUserId, parentUsers.id))
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(asc(players.name)),
    db
      .select({
        id: players.id,
        name: players.name,
        birthYear: players.birthYear,
        skillLevel: players.skillLevel,
        parentName: parentUsers.name,
      })
      .from(players)
      .innerJoin(parentUsers, eq(players.parentUserId, parentUsers.id))
      .orderBy(asc(players.name)),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(inArray(users.role, ["admin", "manager", "coach"]))
      .orderBy(asc(users.name)),
  ]);

  const playerMemberIds = new Set(playerRows.map((player) => player.playerId));
  const coachMemberIds = new Set(
    memberRows.filter((member) => member.role === "coach" || member.role === "manager").map((member) => member.userId),
  );

  return {
    status: "ok" as const,
    data: {
      group,
      members: memberRows,
      playerMembers: playerRows,
      availablePlayers: allPlayers.filter((player) => !playerMemberIds.has(player.id)),
      availableCoaches: coachUsers.filter((coach) => !coachMemberIds.has(coach.id)),
    } satisfies GroupMembersManagementData,
  };
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
  const [memberRows, sessionRows, announcementRows, stats, userGroups, canManageSessions, canManageAnnouncements] = await Promise.all([
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
    db
      .select({
        id: groupAnnouncements.id,
        title: groupAnnouncements.title,
        content: groupAnnouncements.content,
        createdAt: groupAnnouncements.createdAt,
        updatedAt: groupAnnouncements.updatedAt,
        authorName: users.name,
        authorRole: users.role,
      })
      .from(groupAnnouncements)
      .innerJoin(users, eq(groupAnnouncements.authorId, users.id))
      .where(eq(groupAnnouncements.groupId, groupId))
      .orderBy(desc(groupAnnouncements.createdAt))
      .limit(8),
    getGroupStats(groupId),
    getGroupsForUser(user),
    canManageGroupSessions(groupId, user),
    canManageGroupAnnouncements(groupId, user),
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
  const currentUserDirectMember = memberRows.find((member) => member.userId === user.id);
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
      canManage: userGroups.find((userGroup) => userGroup.id === groupId)?.canManage ?? false,
      currentUserRole: currentUserDirectMember?.role ?? null,
      canLeave: Boolean(currentUserDirectMember),
      canManageSessions,
      canManageAnnouncements,
      coaches,
      players: playerRows,
      members: directMembers,
      sessions: sessionRows.map((session) => ({
        ...session,
        state: getSessionState(session.sessionDate, session.startTime),
      })),
      announcements: announcementRows.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString(),
        authorName: announcement.authorName,
        authorRole: announcement.authorRole,
      })),
    },
  };
}
