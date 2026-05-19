import "server-only";

import { count, eq, inArray } from "drizzle-orm";

import type { AuthUser } from "@/auth/token";
import { db, groupMembers, players, users } from "@/db";

export type ProfileData = {
  id: number;
  email: string;
  name: string;
  role: AuthUser["role"];
  createdAt: string;
  linkedPlayersCount: number;
  directMembershipsCount: number;
  playerMembershipsCount: number;
};

export async function getProfileData(user: AuthUser): Promise<ProfileData | null> {
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row) {
    return null;
  }

  const ownedPlayers = await db.select({ id: players.id }).from(players).where(eq(players.parentUserId, user.id));
  const ownedPlayerIds = ownedPlayers.map((player) => player.id);
  const [[{ total: directMembershipsCount }], [{ total: playerMembershipsCount }]] = await Promise.all([
    db.select({ total: count() }).from(groupMembers).where(eq(groupMembers.userId, user.id)),
    ownedPlayerIds.length
      ? db.select({ total: count() }).from(groupMembers).where(inArray(groupMembers.playerId, ownedPlayerIds))
      : Promise.resolve([{ total: 0 }]),
  ]);

  return {
    ...row,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    linkedPlayersCount: ownedPlayers.length,
    directMembershipsCount,
    playerMembershipsCount,
  };
}
