import { describe, expect, it } from "vitest";

import {
  parseAttendanceBody,
  parseCommentBody,
  parseEventRegistrationBody,
  parseLoginBody,
  parsePaginationParams,
  parseRegisterBody,
  parseRequiredId,
} from "./api-validation";

describe("api validation helpers", () => {
  it("normalizes pagination and computes offset", () => {
    const result = parsePaginationParams(new URLSearchParams("page=3&pageSize=15"));

    expect(result).toEqual({ page: 3, pageSize: 15, offset: 30 });
  });

  it("falls back to safe pagination defaults and caps page size", () => {
    expect(parsePaginationParams(new URLSearchParams("page=nope&pageSize=999"))).toEqual({
      page: 1,
      pageSize: 20,
      offset: 0,
    });
  });

  it("requires positive numeric ids", () => {
    expect(parseRequiredId("42", "Invalid id.")).toEqual({ success: true, value: 42 });
    expect(parseRequiredId("0", "Invalid id.")).toEqual({ success: false, error: "Invalid id." });
  });

  it("normalizes login and register credentials", () => {
    expect(parseLoginBody({ email: " PARENT@CLUB.test ", password: "secret" })).toEqual({
      success: true,
      data: { email: "parent@club.test", password: "secret" },
    });

    expect(parseRegisterBody({ name: " Pat ", email: " PAT@CLUB.test ", password: "12345" })).toEqual({
      success: false,
      error: "Password must be at least 6 characters.",
    });
  });

  it("validates attendance status and trims notes", () => {
    const note = ` ${"arriving after school ".repeat(20)}`;
    const parsed = parseAttendanceBody({ playerId: "7", status: "maybe", note });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({ playerId: 7, status: "maybe" });
      expect(parsed.data.note).toHaveLength(240);
      expect(parsed.data.note.startsWith("arriving")).toBe(true);
    }

    expect(parseAttendanceBody({ playerId: 7, status: "late" })).toEqual({
      success: false,
      error: "status must be attending, absent, or maybe.",
    });
  });

  it("trims comments and supports optional event player ids", () => {
    expect(parseCommentBody({ text: "  Ready for doubles  " })).toEqual({
      success: true,
      data: { text: "Ready for doubles" },
    });
    expect(parseCommentBody({ text: "   " })).toEqual({ success: false, error: "Comment text is required." });

    expect(parseEventRegistrationBody({})).toEqual({ success: true, data: { playerId: null } });
    expect(parseEventRegistrationBody({ playerId: "11" })).toEqual({ success: true, data: { playerId: 11 } });
  });
});
