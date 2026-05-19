import "dotenv/config";
import bcrypt from "bcrypt";
import { inArray, sql } from "drizzle-orm";

import {
  db,
  eventRegistrations,
  events,
  groupAnnouncements,
  groupInvitations,
  groupMembers,
  groups,
  players,
  sessionAttendance,
  sessionComments,
  sessions,
  users,
  venues,
} from ".";

const password = "pass123";
const batchSize = 1000;
const userCount = 3000;
const playerCount = 2500;
const venueCount = 50;
const groupCount = 500;
const sessionCount = 5000;
const commentsPerSession = 3;
const attendancePerSession = 3;

function assertSafeDatabase() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run performance seed with NODE_ENV=production.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function timeForIndex(index: number) {
  const hour = 8 + (index % 12);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

async function insertInBatches<T extends Record<string, unknown>, R>(
  label: string,
  values: T[],
  insert: (batch: T[]) => Promise<R[]>,
) {
  const inserted: R[] = [];

  for (const [index, batch] of chunk(values, batchSize).entries()) {
    const rows = await insert(batch);
    inserted.push(...rows);
    console.log(`${label}: inserted ${Math.min((index + 1) * batchSize, values.length)} / ${values.length}`);
  }

  return inserted;
}

async function cleanupPerformanceData() {
  console.log("Cleaning previous performance demo data...");

  const performanceGroupIds = await db
    .select({ id: groups.id })
    .from(groups)
    .where(sql`${groups.title} like 'Performance Group %'`);
  const performanceEventIds = await db
    .select({ id: events.id })
    .from(events)
    .where(sql`${events.title} like 'Performance Event %'`);
  const performanceUserIds = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`${users.email} like 'performance.user%@badminton.test'`);
  const performanceVenueIds = await db
    .select({ id: venues.id })
    .from(venues)
    .where(sql`${venues.name} like 'Performance Venue %'`);

  if (performanceGroupIds.length) {
    const groupIds = performanceGroupIds.map((group) => group.id);
    const performanceSessionIds = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(inArray(sessions.groupId, groupIds));
    const sessionIds = performanceSessionIds.map((session) => session.id);

    if (sessionIds.length) {
      await db.delete(sessionComments).where(inArray(sessionComments.sessionId, sessionIds));
      await db.delete(sessionAttendance).where(inArray(sessionAttendance.sessionId, sessionIds));
      await db.delete(sessions).where(inArray(sessions.id, sessionIds));
    }

    await db.delete(groupAnnouncements).where(inArray(groupAnnouncements.groupId, groupIds));
    await db.delete(groupInvitations).where(inArray(groupInvitations.groupId, groupIds));
    await db.delete(groupMembers).where(inArray(groupMembers.groupId, groupIds));
    await db.delete(groups).where(inArray(groups.id, groupIds));
  }

  if (performanceEventIds.length) {
    const eventIds = performanceEventIds.map((event) => event.id);
    await db.delete(eventRegistrations).where(inArray(eventRegistrations.eventId, eventIds));
    await db.delete(events).where(inArray(events.id, eventIds));
  }

  if (performanceUserIds.length) {
    const userIds = performanceUserIds.map((user) => user.id);
    await db.delete(players).where(inArray(players.parentUserId, userIds));
    await db.delete(users).where(inArray(users.id, userIds));
  }

  if (performanceVenueIds.length) {
    const venueIds = performanceVenueIds.map((venue) => venue.id);
    await db.delete(venues).where(inArray(venues.id, venueIds));
  }
}

async function main() {
  assertSafeDatabase();
  await cleanupPerformanceData();

  console.log("Hashing demo password...");
  const passwordHash = await bcrypt.hash(password, 10);

  const insertedUsers = await insertInBatches(
    "Users",
    Array.from({ length: userCount }, (_, index) => {
      const number = index + 1;
      const role = number === 1 ? "admin" : number <= 20 ? "manager" : number <= 120 ? "coach" : "parent";

      return {
        email: `performance.user${number}@badminton.test`,
        passwordHash,
        name: `Performance User ${number}`,
        role: role as "admin" | "manager" | "coach" | "parent",
      };
    }),
    (batch) => db.insert(users).values(batch).returning(),
  );

  const insertedPlayers = await insertInBatches(
    "Players",
    Array.from({ length: playerCount }, (_, index) => ({
      name: `Performance Player ${index + 1}`,
      birthYear: 2006 + (index % 12),
      skillLevel: (index % 4 === 0 ? "beginner" : index % 4 === 1 ? "intermediate" : index % 4 === 2 ? "advanced" : "competitive") as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "competitive",
      parentUserId: insertedUsers[120 + (index % (insertedUsers.length - 120))].id,
    })),
    (batch) => db.insert(players).values(batch).returning(),
  );

  const insertedVenues = await insertInBatches(
    "Venues",
    Array.from({ length: venueCount }, (_, index) => ({
      name: `Performance Venue ${index + 1}`,
      address: `${index + 1} Demo Court Street`,
      city: `Demo City ${(index % 10) + 1}`,
      description: "Generated performance testing venue.",
    })),
    (batch) => db.insert(venues).values(batch).returning(),
  );

  const insertedGroups = await insertInBatches(
    "Groups",
    Array.from({ length: groupCount }, (_, index) => ({
      title: `Performance Group ${index + 1}`,
      description: "Generated performance testing group.",
      level: (index % 4 === 0 ? "beginner" : index % 4 === 1 ? "intermediate" : index % 4 === 2 ? "advanced" : "competitive") as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "competitive",
      minAge: 7 + (index % 8),
      maxAge: 12 + (index % 8),
      venueId: insertedVenues[index % insertedVenues.length].id,
    })),
    (batch) => db.insert(groups).values(batch).returning(),
  );

  const membershipRows = insertedGroups.flatMap((group, index) => {
    const rows: (typeof groupMembers.$inferInsert)[] = [
      { groupId: group.id, userId: insertedUsers[index % 20].id, role: "manager" },
      { groupId: group.id, userId: insertedUsers[20 + (index % 100)].id, role: "coach" },
    ];
    const playerMemberships = index < 3 ? 200 : 8;

    for (let playerIndex = 0; playerIndex < playerMemberships; playerIndex++) {
      rows.push({
        groupId: group.id,
        playerId: insertedPlayers[(index * 8 + playerIndex) % insertedPlayers.length].id,
        role: "player",
      });
    }

    return rows;
  });

  await insertInBatches("Group memberships", membershipRows, (batch) => db.insert(groupMembers).values(batch).returning());

  const today = new Date();
  const insertedSessions = await insertInBatches(
    "Sessions",
    Array.from({ length: sessionCount }, (_, index) => ({
      groupId: insertedGroups[index % 3].id,
      sessionDate: toDateOnly(addDays(today, index % 365)),
      startTime: timeForIndex(index),
      venueId: insertedVenues[index % insertedVenues.length].id,
      coachUserId: insertedUsers[20 + (index % 100)].id,
      capacity: 18 + (index % 12),
      canceled: index % 97 === 0,
    })),
    (batch) => db.insert(sessions).values(batch).returning(),
  );

  const attendanceRows = insertedSessions.flatMap((session, index) =>
    Array.from({ length: attendancePerSession }, (_, attendanceIndex) => {
      const player = insertedPlayers[(index * attendancePerSession + attendanceIndex) % 600];

      return {
        sessionId: session.id,
        playerId: player.id,
        parentUserId: player.parentUserId,
        status: (attendanceIndex % 3 === 0 ? "attending" : attendanceIndex % 3 === 1 ? "absent" : "maybe") as "attending" | "absent" | "maybe",
        note: `Performance attendance note ${index + 1}-${attendanceIndex + 1}`,
        markedAt: new Date(),
      };
    }),
  );

  await insertInBatches("Attendance records", attendanceRows, (batch) => db.insert(sessionAttendance).values(batch).returning());

  const commentRows = insertedSessions.flatMap((session, index) =>
    Array.from({ length: commentsPerSession }, (_, commentIndex) => ({
      sessionId: session.id,
      userId: insertedUsers[(index + commentIndex) % insertedUsers.length].id,
      text: `Performance demo comment ${index + 1}-${commentIndex + 1}. Generated for large dataset testing.`,
      commentedAt: addDays(today, -(commentIndex + (index % 30))),
    })),
  );

  await insertInBatches("Session comments", commentRows, (batch) => db.insert(sessionComments).values(batch).returning());

  console.log("Performance seed complete.");
  console.log(`Created ${insertedUsers.length} users.`);
  console.log(`Created ${insertedPlayers.length} players.`);
  console.log(`Created ${insertedVenues.length} venues.`);
  console.log(`Created ${insertedGroups.length} groups.`);
  console.log(`Created ${insertedSessions.length} sessions.`);
  console.log(`Created ${attendanceRows.length} attendance records.`);
  console.log(`Created ${commentRows.length} session comments.`);
}

main().catch((error) => {
  console.error("Performance seed failed.");
  console.error(error);
  process.exit(1);
});
