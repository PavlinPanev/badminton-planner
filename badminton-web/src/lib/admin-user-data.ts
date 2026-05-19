import "server-only";

import { asc, count, desc, eq } from "drizzle-orm";

import type { AuthUser } from "@/auth/token";
import { db, users } from "@/db";

export type UserRole = "admin" | "manager" | "coach" | "parent";

export const userRoles: UserRole[] = ["admin", "manager", "coach", "parent"];

export type AdminUserListItem = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

export type AdminUsersPageResult = {
  users: AdminUserListItem[];
  paging: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

function normalizePage(value: number | undefined) {
  return Math.max(Number(value) || 1, 1);
}

function normalizePageSize(value: number | undefined) {
  return Math.min(Math.max(Number(value) || 20, 1), 50);
}

export function canManageUsers(user: AuthUser | null) {
  return user?.role === "admin";
}

export function isUserRole(value: FormDataEntryValue | null): value is UserRole {
  return typeof value === "string" && userRoles.includes(value as UserRole);
}

export async function getAdminUsersPage(options?: {
  page?: number;
  pageSize?: number;
}): Promise<AdminUsersPageResult> {
  const page = normalizePage(options?.page);
  const pageSize = normalizePageSize(options?.pageSize);
  const offset = (page - 1) * pageSize;

  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(users),
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt), asc(users.email))
      .limit(pageSize)
      .offset(offset),
  ]);

  return {
    users: rows.map((user) => ({
      ...user,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
    })),
    paging: {
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  };
}

export async function countAdmins() {
  const [{ total }] = await db.select({ total: count() }).from(users).where(eq(users.role, "admin"));
  return total;
}
