import { count, desc, eq, inArray } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getApiUser, paginationMeta, parsePage } from "@/auth/api";
import { db, groupAnnouncements, groupMembers, groups, players, users } from "@/db";

async function getOwnedPlayerIds(userId: number) {
  const rows = await db.select({ id: players.id }).from(players).where(eq(players.parentUserId, userId));
  return rows.map((row) => row.id);
}

async function getUserGroupIds(userId: number) {
  const [directMemberships, ownedPlayerIds] = await Promise.all([
    db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId)),
    getOwnedPlayerIds(userId),
  ]);

  const playerMemberships = ownedPlayerIds.length
    ? await db
        .select({ groupId: groupMembers.groupId })
        .from(groupMembers)
        .where(inArray(groupMembers.playerId, ownedPlayerIds))
    : [];

  return Array.from(new Set([...directMemberships, ...playerMemberships].map((membership) => membership.groupId)));
}

export async function GET(request: NextRequest) {
  const auth = await getApiUser(request);

  if (auth.error) {
    return auth.error;
  }

  const { page, pageSize, offset } = parsePage(request);
  const groupIds = await getUserGroupIds(auth.user.id);

  if (groupIds.length === 0) {
    return Response.json({
      data: [],
      paging: paginationMeta(page, pageSize, 0),
    });
  }

  const where = inArray(groupAnnouncements.groupId, groupIds);
  const [[{ total: totalCount }], pageItems] = await Promise.all([
    db.select({ total: count() }).from(groupAnnouncements).where(where),
    db
      .select({
        id: groupAnnouncements.id,
        title: groupAnnouncements.title,
        content: groupAnnouncements.content,
        createdAt: groupAnnouncements.createdAt,
        updatedAt: groupAnnouncements.updatedAt,
        groupId: groups.id,
        groupTitle: groups.title,
        authorId: users.id,
        authorName: users.name,
        authorRole: users.role,
      })
      .from(groupAnnouncements)
      .innerJoin(groups, eq(groupAnnouncements.groupId, groups.id))
      .innerJoin(users, eq(groupAnnouncements.authorId, users.id))
      .where(where)
      .orderBy(desc(groupAnnouncements.createdAt))
      .limit(pageSize)
      .offset(offset),
  ]);

  return Response.json({
    data: pageItems.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      group: {
        id: announcement.groupId,
        title: announcement.groupTitle,
      },
      author: {
        id: announcement.authorId,
        name: announcement.authorName,
        role: announcement.authorRole,
      },
    })),
    paging: paginationMeta(page, pageSize, totalCount),
  });
}
