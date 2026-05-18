export type SessionState = "upcoming" | "current" | "past";
export type CapacityState = "under capacity" | "full capacity" | "over capacity";
export type AttendanceStatus = "attending" | "absent" | "maybe" | "no response";

export const sessionDurationMinutes = 90;

export function getSessionStart(sessionDate: string, startTime: string) {
  const normalizedTime = startTime.length === 5 ? `${startTime}:00` : startTime;
  return new Date(`${sessionDate}T${normalizedTime}`);
}

export function getSessionEnd(sessionDate: string, startTime: string) {
  const start = getSessionStart(sessionDate, startTime);
  return new Date(start.getTime() + sessionDurationMinutes * 60 * 1000);
}

export function getSessionState(sessionDate: string, startTime: string, now = new Date()): SessionState {
  const start = getSessionStart(sessionDate, startTime);
  const end = getSessionEnd(sessionDate, startTime);

  if (now < start) {
    return "upcoming";
  }

  if (now <= end) {
    return "current";
  }

  return "past";
}

export function getCapacityState(attendingCount: number, capacity: number | null): CapacityState {
  if (!capacity || attendingCount < capacity) {
    return "under capacity";
  }

  if (attendingCount === capacity) {
    return "full capacity";
  }

  return "over capacity";
}

export function formatSessionDate(sessionDate: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(`${sessionDate}T00:00:00`));
}

export function formatSessionTime(startTime: string) {
  return startTime.slice(0, 5);
}
