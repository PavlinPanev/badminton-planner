import "dotenv/config";
import bcrypt from "bcrypt";
import { inArray } from "drizzle-orm";

import {
  db,
  eventRegistrations,
  events,
  groupAnnouncements,
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
const seededEmails = [
  "admin@badminton.test",
  "manager@badminton.test",
  "coach1@badminton.test",
  "coach2@badminton.test",
  "parent1@badminton.test",
  "parent2@badminton.test",
  "parent3@badminton.test",
  ...Array.from({ length: 20 }, (_, index) => `user${index + 1}@badminton.test`),
];
const seededPlayerNames = Array.from({ length: 30 }, (_, index) => `Player ${index + 1}`);
const seededVenueNames = [
  "Sofia Sports Hall",
  "Sofia Akademik Hall",
  "Elin Pelin Sports Hall",
  "Chelopechene Sports Hall",
  "Gorna Malina Sports Hall",
];
const seededGroupTitles = [
  "Sofia Beginners 6-9",
  "Sofia Advanced Juniors",
  "Elin Pelin Beginners",
  "Social Badminton Adults",
];
const seededEventTitles = [
  "Children's Badminton Tournament",
  "Social Badminton Weekend",
  "Summer Badminton Camp",
  "Open Training Day",
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function atLocalHour(date: Date, hour: number) {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);
  return next;
}

async function cleanupSeedData() {
  const existingGroups = await db
    .select({ id: groups.id })
    .from(groups)
    .where(inArray(groups.title, seededGroupTitles));
  const existingSessions = existingGroups.length
    ? await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(
          inArray(
            sessions.groupId,
            existingGroups.map((group) => group.id),
          ),
        )
    : [];
  const existingEvents = await db
    .select({ id: events.id })
    .from(events)
    .where(inArray(events.title, seededEventTitles));

  if (existingSessions.length) {
    const sessionIds = existingSessions.map((session) => session.id);
    await db.delete(sessionComments).where(inArray(sessionComments.sessionId, sessionIds));
    await db.delete(sessionAttendance).where(inArray(sessionAttendance.sessionId, sessionIds));
    await db.delete(sessions).where(inArray(sessions.id, sessionIds));
  }

  if (existingGroups.length) {
    const groupIds = existingGroups.map((group) => group.id);
    await db.delete(groupAnnouncements).where(inArray(groupAnnouncements.groupId, groupIds));
    await db.delete(groupMembers).where(inArray(groupMembers.groupId, groupIds));
    await db.delete(groups).where(inArray(groups.id, groupIds));
  }

  if (existingEvents.length) {
    const eventIds = existingEvents.map((event) => event.id);
    await db.delete(eventRegistrations).where(inArray(eventRegistrations.eventId, eventIds));
    await db.delete(events).where(inArray(events.id, eventIds));
  }

  await db.delete(players).where(inArray(players.name, seededPlayerNames));
  await db.delete(users).where(inArray(users.email, seededEmails));
  await db.delete(venues).where(inArray(venues.name, seededVenueNames));
}

async function main() {
  await cleanupSeedData();

  const passwordHash = await bcrypt.hash(password, 10);

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        email: "admin@badminton.test",
        passwordHash,
        name: "Demo Admin",
        role: "admin",
      },
      {
        email: "manager@badminton.test",
        passwordHash,
        name: "Demo Manager",
        role: "manager",
      },
      {
        email: "coach1@badminton.test",
        passwordHash,
        name: "Demo Coach 1",
        role: "coach",
      },
      {
        email: "coach2@badminton.test",
        passwordHash,
        name: "Demo Coach 2",
        role: "coach",
      },
      {
        email: "parent1@badminton.test",
        passwordHash,
        name: "Demo Parent 1",
        role: "parent",
      },
      {
        email: "parent2@badminton.test",
        passwordHash,
        name: "Demo Parent 2",
        role: "parent",
      },
      {
        email: "parent3@badminton.test",
        passwordHash,
        name: "Demo Parent 3",
        role: "parent",
      },
      ...Array.from({ length: 20 }, (_, index) => ({
        email: `user${index + 1}@badminton.test`,
        passwordHash,
        name: `Demo User ${index + 1}`,
        role: "parent" as const,
      })),
    ])
    .returning();

  const userByEmail = new Map(insertedUsers.map((user) => [user.email, user]));
  const manager = userByEmail.get("manager@badminton.test")!;
  const coach1 = userByEmail.get("coach1@badminton.test")!;
  const coach2 = userByEmail.get("coach2@badminton.test")!;
  const parents = [
    userByEmail.get("parent1@badminton.test")!,
    userByEmail.get("parent2@badminton.test")!,
    userByEmail.get("parent3@badminton.test")!,
  ];
  const adultUsers = Array.from({ length: 20 }, (_, index) => userByEmail.get(`user${index + 1}@badminton.test`)!);

  const insertedPlayers = await db
    .insert(players)
    .values(
      Array.from({ length: 30 }, (_, index) => ({
        name: `Player ${index + 1}`,
        birthYear: 2010 + (index % 10),
        skillLevel: (index < 12 ? "beginner" : index < 24 ? "advanced" : "intermediate") as
          | "beginner"
          | "advanced"
          | "intermediate",
        parentUserId: parents[index % parents.length].id,
      })),
    )
    .returning();

  const insertedVenues = await db
    .insert(venues)
    .values([
      {
        name: "Sofia Sports Hall",
        address: "1 Sportna Street",
        city: "Sofia",
        description: "Main demo venue for club training and events.",
      },
      {
        name: "Sofia Akademik Hall",
        address: "4 Akademik Avenue",
        city: "Sofia",
        description: "Indoor hall suitable for junior and advanced sessions.",
      },
      {
        name: "Elin Pelin Sports Hall",
        address: "8 Nikola Vaptsarov Street",
        city: "Elin Pelin",
        description: "Community sports hall for beginner training groups.",
      },
      {
        name: "Chelopechene Sports Hall",
        address: "12 Central Square",
        city: "Chelopechene",
        description: "Local sports hall for regional club activities.",
      },
      {
        name: "Gorna Malina Sports Hall",
        address: "3 Hristo Botev Street",
        city: "Gorna Malina",
        description: "Regional hall for camps and open badminton days.",
      },
    ])
    .returning();

  const venueByName = new Map(insertedVenues.map((venue) => [venue.name, venue]));

  const insertedGroups = await db
    .insert(groups)
    .values([
      {
        title: "Sofia Beginners 6-9",
        description: "Beginner group for younger players in Sofia.",
        level: "beginner",
        minAge: 6,
        maxAge: 9,
        venueId: venueByName.get("Sofia Sports Hall")!.id,
      },
      {
        title: "Sofia Advanced Juniors",
        description: "Advanced junior training group in Sofia.",
        level: "advanced",
        minAge: 10,
        maxAge: 16,
        venueId: venueByName.get("Sofia Akademik Hall")!.id,
      },
      {
        title: "Elin Pelin Beginners",
        description: "Beginner group for players training in Elin Pelin.",
        level: "beginner",
        minAge: 7,
        maxAge: 13,
        venueId: venueByName.get("Elin Pelin Sports Hall")!.id,
      },
      {
        title: "Social Badminton Adults",
        description: "Friendly social badminton group for adult members.",
        level: "intermediate",
        minAge: 18,
        venueId: venueByName.get("Sofia Sports Hall")!.id,
      },
    ])
    .returning();

  const groupByTitle = new Map(insertedGroups.map((group) => [group.title, group]));
  const groupMemberRows = [
    {
      groupId: groupByTitle.get("Sofia Beginners 6-9")!.id,
      userId: manager.id,
      role: "manager" as const,
    },
    {
      groupId: groupByTitle.get("Sofia Beginners 6-9")!.id,
      userId: coach1.id,
      role: "coach" as const,
    },
    ...insertedPlayers.slice(0, 12).map((player) => ({
      groupId: groupByTitle.get("Sofia Beginners 6-9")!.id,
      playerId: player.id,
      role: "player" as const,
    })),
    {
      groupId: groupByTitle.get("Sofia Advanced Juniors")!.id,
      userId: manager.id,
      role: "manager" as const,
    },
    {
      groupId: groupByTitle.get("Sofia Advanced Juniors")!.id,
      userId: coach2.id,
      role: "coach" as const,
    },
    ...insertedPlayers.slice(12, 24).map((player) => ({
      groupId: groupByTitle.get("Sofia Advanced Juniors")!.id,
      playerId: player.id,
      role: "player" as const,
    })),
    {
      groupId: groupByTitle.get("Elin Pelin Beginners")!.id,
      userId: manager.id,
      role: "manager" as const,
    },
    {
      groupId: groupByTitle.get("Elin Pelin Beginners")!.id,
      userId: coach1.id,
      role: "coach" as const,
    },
    ...insertedPlayers.slice(4, 18).map((player) => ({
      groupId: groupByTitle.get("Elin Pelin Beginners")!.id,
      playerId: player.id,
      role: "player" as const,
    })),
    {
      groupId: groupByTitle.get("Social Badminton Adults")!.id,
      userId: manager.id,
      role: "manager" as const,
    },
    {
      groupId: groupByTitle.get("Social Badminton Adults")!.id,
      userId: coach2.id,
      role: "coach" as const,
    },
    ...adultUsers.map((user) => ({
      groupId: groupByTitle.get("Social Badminton Adults")!.id,
      userId: user.id,
      role: "parent" as const,
    })),
  ];

  await db.insert(groupMembers).values(groupMemberRows);

  const today = new Date();
  const insertedSessions = await db
    .insert(sessions)
    .values([
      {
        groupId: groupByTitle.get("Sofia Beginners 6-9")!.id,
        sessionDate: toDateOnly(addDays(today, 3)),
        startTime: "17:00",
        venueId: venueByName.get("Sofia Sports Hall")!.id,
        coachUserId: coach1.id,
        capacity: 16,
      },
      {
        groupId: groupByTitle.get("Sofia Advanced Juniors")!.id,
        sessionDate: toDateOnly(addDays(today, 5)),
        startTime: "18:30",
        venueId: venueByName.get("Sofia Akademik Hall")!.id,
        coachUserId: coach2.id,
        capacity: 16,
      },
      {
        groupId: groupByTitle.get("Elin Pelin Beginners")!.id,
        sessionDate: toDateOnly(addDays(today, 6)),
        startTime: "17:30",
        venueId: venueByName.get("Elin Pelin Sports Hall")!.id,
        coachUserId: coach1.id,
        capacity: 14,
      },
      {
        groupId: groupByTitle.get("Social Badminton Adults")!.id,
        sessionDate: toDateOnly(addDays(today, 7)),
        startTime: "19:00",
        venueId: venueByName.get("Sofia Sports Hall")!.id,
        coachUserId: coach2.id,
        capacity: 20,
      },
      {
        groupId: groupByTitle.get("Sofia Beginners 6-9")!.id,
        sessionDate: toDateOnly(addDays(today, -20)),
        startTime: "17:00",
        venueId: venueByName.get("Sofia Sports Hall")!.id,
        coachUserId: coach1.id,
        capacity: 16,
      },
      {
        groupId: groupByTitle.get("Sofia Advanced Juniors")!.id,
        sessionDate: toDateOnly(addDays(today, -30)),
        startTime: "18:30",
        venueId: venueByName.get("Sofia Akademik Hall")!.id,
        coachUserId: coach2.id,
        capacity: 16,
      },
    ])
    .returning();

  for (const [sessionIndex, session] of insertedSessions.entries()) {
    const playerOffset = (sessionIndex * 4) % insertedPlayers.length;
    const sessionPlayers = insertedPlayers.slice(playerOffset, playerOffset + 4);

    await db.insert(sessionAttendance).values([
      {
        sessionId: session.id,
        playerId: sessionPlayers[0].id,
        parentUserId: sessionPlayers[0].parentUserId,
        status: "attending",
        note: "Demo attending response.",
      },
      {
        sessionId: session.id,
        playerId: sessionPlayers[1].id,
        parentUserId: sessionPlayers[1].parentUserId,
        status: "absent",
        note: "Demo absent response.",
      },
      {
        sessionId: session.id,
        playerId: sessionPlayers[2].id,
        parentUserId: sessionPlayers[2].parentUserId,
        status: "maybe",
        note: "Demo maybe response.",
      },
    ]);

    await db.insert(sessionComments).values([
      {
        sessionId: session.id,
        userId: sessionIndex % 2 === 0 ? coach1.id : coach2.id,
        text: "Coach note for this demo session.",
      },
      {
        sessionId: session.id,
        userId: manager.id,
        text: "Manager reminder for venue and capacity planning.",
      },
      {
        sessionId: session.id,
        userId: parents[sessionIndex % parents.length].id,
        text: "Parent comment for attendance coordination.",
      },
    ]);
  }

  const insertedEvents = await db
    .insert(events)
    .values([
      {
        title: "Children's Badminton Tournament",
        description: "Demo youth tournament for club players.",
        venueId: venueByName.get("Sofia Sports Hall")!.id,
        eventDate: atLocalHour(addDays(today, 14), 10),
        capacity: 48,
      },
      {
        title: "Social Badminton Weekend",
        description: "Demo weekend session for adult social badminton.",
        venueId: venueByName.get("Sofia Akademik Hall")!.id,
        eventDate: atLocalHour(addDays(today, 21), 11),
        capacity: 32,
      },
      {
        title: "Summer Badminton Camp",
        description: "Demo summer camp for junior players.",
        venueId: venueByName.get("Gorna Malina Sports Hall")!.id,
        eventDate: atLocalHour(addDays(today, 45), 9),
        capacity: 40,
      },
      {
        title: "Open Training Day",
        description: "Demo open day for new players and families.",
        venueId: venueByName.get("Chelopechene Sports Hall")!.id,
        eventDate: atLocalHour(addDays(today, 10), 16),
        capacity: 24,
      },
    ])
    .returning();

  await db.insert(eventRegistrations).values([
    {
      eventId: insertedEvents[0].id,
      userId: parents[0].id,
      playerId: insertedPlayers[0].id,
      status: "registered",
    },
    {
      eventId: insertedEvents[0].id,
      userId: parents[1].id,
      playerId: insertedPlayers[1].id,
      status: "registered",
    },
    {
      eventId: insertedEvents[1].id,
      userId: adultUsers[0].id,
      status: "registered",
    },
    {
      eventId: insertedEvents[1].id,
      userId: adultUsers[1].id,
      status: "waitlisted",
    },
    {
      eventId: insertedEvents[2].id,
      userId: parents[2].id,
      playerId: insertedPlayers[12].id,
      status: "registered",
    },
    {
      eventId: insertedEvents[3].id,
      userId: manager.id,
      status: "registered",
    },
  ]);

  const insertedAnnouncements = await db
    .insert(groupAnnouncements)
    .values([
      {
        groupId: groupByTitle.get("Sofia Beginners 6-9")!.id,
        authorId: manager.id,
        title: "Welcome to the new season!",
        content: "We are excited to kick off the new training season with everyone. Don't forget to bring plenty of water and your indoor shoes.",
      },
      {
        groupId: groupByTitle.get("Sofia Advanced Juniors")!.id,
        authorId: coach2.id,
        title: "New tournament dates announced",
        content: "Please check the events tab to register for the upcoming regional tournament. Selection is first-come, first-served.",
      },
      {
        groupId: groupByTitle.get("Social Badminton Adults")!.id,
        authorId: coach2.id,
        title: "Social Sunday session fully booked",
        content: "This week's social session reached full capacity in record time! Please remember to mark yourself as absent if your plans change.",
      },
    ])
    .returning();

  console.log(
    `Seeded ${insertedUsers.length} users, ${insertedPlayers.length} players, ${insertedGroups.length} groups, ${insertedSessions.length} sessions, ${insertedEvents.length} events, and ${insertedAnnouncements.length} announcements.`,
  );
}

main().catch((error) => {
  console.error("Database seed failed.");
  console.error(error);
  process.exit(1);
});
