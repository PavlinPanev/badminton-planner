import type { AuthUser } from "@/auth/token";

type Role = AuthUser["role"];

export function isAdmin(user: Pick<AuthUser, "role"> | null) {
  return user?.role === "admin";
}

export function canManageUsers(user: Pick<AuthUser, "role"> | null) {
  return isAdmin(user);
}

export function canManageClubResources(user: Pick<AuthUser, "role">) {
  return user.role === "admin" || user.role === "manager";
}

export function canCreateGroups(user: Pick<AuthUser, "role">) {
  return canManageClubResources(user);
}

export function canManageEvents(user: Pick<AuthUser, "role">) {
  return canManageClubResources(user);
}

export function canManageVenues(user: Pick<AuthUser, "role">) {
  return canManageClubResources(user);
}

export function canManageGroupContent(userRole: Role, membershipRole: string | null | undefined) {
  return userRole === "admin" || membershipRole === "manager" || membershipRole === "coach";
}

export function canManageSessionByAssignment(
  user: Pick<AuthUser, "id" | "role">,
  session: { coachUserId: number | null },
  membershipRole: string | null | undefined,
) {
  return user.role === "admin" || session.coachUserId === user.id || membershipRole === "manager" || membershipRole === "coach";
}
