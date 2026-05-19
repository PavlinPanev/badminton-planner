import { describe, expect, it } from "vitest";

import {
  canCreateGroups,
  canManageEvents,
  canManageGroupContent,
  canManageSessionByAssignment,
  canManageUsers,
  canManageVenues,
} from "./permissions";

const user = (role: "admin" | "manager" | "coach" | "parent", id = 1) => ({ id, role });

describe("permission helpers", () => {
  it("limits user administration to admins", () => {
    expect(canManageUsers(user("admin"))).toBe(true);
    expect(canManageUsers(user("manager"))).toBe(false);
    expect(canManageUsers(null)).toBe(false);
  });

  it("allows managers and admins to manage club-level resources", () => {
    for (const role of ["admin", "manager"] as const) {
      expect(canManageEvents(user(role))).toBe(true);
      expect(canManageVenues(user(role))).toBe(true);
      expect(canCreateGroups(user(role))).toBe(true);
    }

    for (const role of ["coach", "parent"] as const) {
      expect(canManageEvents(user(role))).toBe(false);
      expect(canManageVenues(user(role))).toBe(false);
      expect(canCreateGroups(user(role))).toBe(false);
    }
  });

  it("allows group content changes for admins, managers, and coaches", () => {
    expect(canManageGroupContent("admin", null)).toBe(true);
    expect(canManageGroupContent("parent", "manager")).toBe(true);
    expect(canManageGroupContent("parent", "coach")).toBe(true);
    expect(canManageGroupContent("manager", "parent")).toBe(false);
  });

  it("allows session management by admin, assigned coach, or manager/coach membership", () => {
    expect(canManageSessionByAssignment(user("admin", 5), { coachUserId: null }, null)).toBe(true);
    expect(canManageSessionByAssignment(user("parent", 5), { coachUserId: 5 }, "parent")).toBe(true);
    expect(canManageSessionByAssignment(user("parent", 5), { coachUserId: 9 }, "manager")).toBe(true);
    expect(canManageSessionByAssignment(user("parent", 5), { coachUserId: 9 }, "parent")).toBe(false);
  });
});
