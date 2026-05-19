import { describe, expect, it } from "vitest";

import {
  formatSessionTime,
  getCapacityState,
  getSessionEnd,
  getSessionStart,
  getSessionState,
} from "./session-status";

describe("session status helpers", () => {
  it("parses start and end times deterministically", () => {
    const start = getSessionStart("2026-05-19", "18:30");
    const end = getSessionEnd("2026-05-19", "18:30");

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(4);
    expect(start.getDate()).toBe(19);
    expect(start.getHours()).toBe(18);
    expect(start.getMinutes()).toBe(30);
    expect(end.getTime() - start.getTime()).toBe(90 * 60 * 1000);
  });

  it("classifies upcoming, current, and past sessions at boundaries", () => {
    const start = getSessionStart("2026-05-19", "18:30");
    const end = getSessionEnd("2026-05-19", "18:30");

    expect(getSessionState("2026-05-19", "18:30", new Date(start.getTime() - 1))).toBe("upcoming");
    expect(getSessionState("2026-05-19", "18:30", start)).toBe("current");
    expect(getSessionState("2026-05-19", "18:30", end)).toBe("current");
    expect(getSessionState("2026-05-19", "18:30", new Date(end.getTime() + 1))).toBe("past");
  });

  it("classifies capacity state", () => {
    expect(getCapacityState(0, null)).toBe("under capacity");
    expect(getCapacityState(9, 10)).toBe("under capacity");
    expect(getCapacityState(10, 10)).toBe("full capacity");
    expect(getCapacityState(11, 10)).toBe("over capacity");
  });

  it("formats stored session times for display", () => {
    expect(formatSessionTime("18:30:00")).toBe("18:30");
    expect(formatSessionTime("09:05")).toBe("09:05");
  });
});
