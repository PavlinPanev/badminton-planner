import "dotenv/config";
import bcrypt from "bcrypt";
import { inArray } from "drizzle-orm";

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

const adminEmail = "admin@badminton.test";
const managerEmail = "desislava.ivanova@badminton.test";
const coach1Email = "georgi.stoyanov@badminton.test";
const coach2Email = "petar.kolev@badminton.test";
const parent1Email = "elena.dimitrova@badminton.test";
const parent2Email = "ivan.mihaylov@badminton.test";
const parent3Email = "silvia.vasileva@badminton.test";

const coreUsers = [
  { email: adminEmail, name: "Nikolay Petrov", role: "admin" as const },
  { email: managerEmail, name: "Desislava Ivanova", role: "manager" as const },
  { email: coach1Email, name: "Georgi Stoyanov", role: "coach" as const },
  { email: coach2Email, name: "Petar Kolev", role: "coach" as const },
  { email: parent1Email, name: "Elena Dimitrova", role: "parent" as const },
  { email: parent2Email, name: "Ivan Mihaylov", role: "parent" as const },
  { email: parent3Email, name: "Silvia Vasileva", role: "parent" as const },
];

const extraUsers = [
  { email: "ivaylo.georgiev@badminton.test", name: "Ivaylo Georgiev" },
  { email: "daniela.stoyanova@badminton.test", name: "Daniela Stoyanova" },
  { email: "borislav.angelov@badminton.test", name: "Borislav Angelov" },
  { email: "kalina.marinova@badminton.test", name: "Kalina Marinova" },
  { email: "petya.dimitrova@badminton.test", name: "Petya Dimitrova" },
  { email: "radislav.petkov@badminton.test", name: "Radislav Petkov" },
  { email: "simeon.todorov@badminton.test", name: "Simeon Todorov" },
  { email: "yoana.koleva@badminton.test", name: "Yoana Koleva" },
  { email: "vladimir.iliev@badminton.test", name: "Vladimir Iliev" },
  { email: "vesela.stefanova@badminton.test", name: "Vesela Stefanova" },
  { email: "plamen.rusev@badminton.test", name: "Plamen Rusev" },
  { email: "tanya.ivanova@badminton.test", name: "Tanya Ivanova" },
  { email: "nikola.velchev@badminton.test", name: "Nikola Velchev" },
  { email: "stefka.gancheva@badminton.test", name: "Stefka Gancheva" },
  { email: "emil.tonev@badminton.test", name: "Emil Tonev" },
  { email: "adelina.tsankova@badminton.test", name: "Adelina Tsankova" },
  { email: "georgina.petrova@badminton.test", name: "Georgina Petrova" },
  { email: "hristo.milanov@badminton.test", name: "Hristo Milanov" },
  { email: "yana.kostova@badminton.test", name: "Yana Kostova" },
  { email: "kiril.atanasov@badminton.test", name: "Kiril Atanasov" },
];

const seededEmails = [...coreUsers.map((user) => user.email), ...extraUsers.map((user) => user.email)];

const seededPlayerNames = [
  "Aleksandar Petrov",
  "Borislav Dimitrov",
  "Viktor Hristov",
  "Georgi Stoyanov",
  "Dimitar Ivanov",
  "Elena Petrova",
  "Zornitsa Marinova",
  "Ivaylo Kolev",
  "Kalin Todorov",
  "Liliya Georgieva",
  "Martin Angelov",
  "Nadezhda Petrova",
  "Petar Iliev",
  "Radostina Vasileva",
  "Stefan Nikolov",
  "Tanya Hristova",
  "Hristo Pavlov",
  "Yana Kostova",
  "Kiril Milanov",
  "Maria Popova",
  "Nikola Dimitrov",
  "Ognian Kirov",
  "Preslava Danailova",
  "Radoslav Ganchev",
  "Simona Yaneva",
  "Teodor Stanev",
  "Vanya Petkova",
  "Yordan Zhelev",
  "Zlatina Todorova",
  "Hristina Koleva",
];

const seededVenueNames = [
  "Arena Sofia Hall",
  "Plovdiv Sports Center",
  "Varna Sea Palace",
  "Burgas Mladost Hall",
  "Ruse Danube Arena",
];

const seededGroupTitles = [
  "Sofia Kids 7-10",
  "Plovdiv Advanced Juniors",
  "Varna Beginners",
  "Sofia Social Adults",
];

const seededEventTitles = [
  "Sofia Junior Open",
  "Varna Summer Camp",
  "Burgas Club Social Night",
  "Plovdiv Training Day",
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
    await db.delete(groupInvitations).where(inArray(groupInvitations.groupId, groupIds));
    await db.delete(groupMembers).where(inArray(groupMembers.groupId, groupIds));
    await db.delete(groups).where(inArray(groups.id, groupIds));
  }

  if (existingEvents.length) {
    const eventIds = existingEvents.map((event) => event.id);
    await db.delete(eventRegistrations).where(inArray(eventRegistrations.eventId, eventIds));
    await db.delete(events).where(inArray(events.id, eventIds));
  }

  const existingUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.email, seededEmails));

  if (existingUsers.length) {
    const userIds = existingUsers.map((user) => user.id);
    await db.delete(groupAnnouncements).where(inArray(groupAnnouncements.authorId, userIds));
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
      ...coreUsers.map((user) => ({
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
      })),
      ...extraUsers.map((user) => ({
        email: user.email,
        passwordHash,
        name: user.name,
        role: "parent" as const,
      })),
    ])
    .returning();

  const userByEmail = new Map(insertedUsers.map((user) => [user.email, user]));
  const manager = userByEmail.get(managerEmail)!;
  const coach1 = userByEmail.get(coach1Email)!;
  const coach2 = userByEmail.get(coach2Email)!;
  const parents = [
    userByEmail.get(parent1Email)!,
    userByEmail.get(parent2Email)!,
    userByEmail.get(parent3Email)!,
  ];
  const adultUsers = extraUsers.map((user) => userByEmail.get(user.email)!);

  const insertedPlayers = await db
    .insert(players)
    .values(
      seededPlayerNames.map((name, index) => ({
        name,
        birthYear: 2009 + (index % 9),
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
        name: "Arena Sofia Hall",
        address: "12 Tsarigradsko Shose Blvd",
        city: "Sofia",
        description: "Central training hall with six courts and updated flooring.",
      },
      {
        name: "Plovdiv Sports Center",
        address: "18 Hristo Botev Blvd",
        city: "Plovdiv",
        description: "Multi-sport complex for junior squads and weekend camps.",
      },
      {
        name: "Varna Sea Palace",
        address: "5 Primorski Blvd",
        city: "Varna",
        description: "Coastal hall used for beginner groups and summer programs.",
      },
      {
        name: "Burgas Mladost Hall",
        address: "22 Mladost Street",
        city: "Burgas",
        description: "Community hall for social play and open training days.",
      },
      {
        name: "Ruse Danube Arena",
        address: "9 Dunavska Street",
        city: "Ruse",
        description: "Regional hall hosting weekend training blocks.",
      },
    ])
    .returning();

  const venueByName = new Map(insertedVenues.map((venue) => [venue.name, venue]));

  const insertedGroups = await db
    .insert(groups)
    .values([
      {
        title: "Sofia Kids 7-10",
        description: "Beginner group for young players in Sofia.",
        level: "beginner",
        minAge: 7,
        maxAge: 10,
        venueId: venueByName.get("Arena Sofia Hall")!.id,
      },
      {
        title: "Plovdiv Advanced Juniors",
        description: "Advanced junior squad with extra footwork drills.",
        level: "advanced",
        minAge: 12,
        maxAge: 17,
        venueId: venueByName.get("Plovdiv Sports Center")!.id,
      },
      {
        title: "Varna Beginners",
        description: "Friendly beginner group focused on basics and fun games.",
        level: "beginner",
        minAge: 8,
        maxAge: 12,
        venueId: venueByName.get("Varna Sea Palace")!.id,
      },
      {
        title: "Sofia Social Adults",
        description: "Evening social badminton for adult members and parents.",
        level: "intermediate",
        minAge: 18,
        venueId: venueByName.get("Arena Sofia Hall")!.id,
      },
    ])
    .returning();

  const groupByTitle = new Map(insertedGroups.map((group) => [group.title, group]));
  const groupMemberRows = [
    {
      groupId: groupByTitle.get("Sofia Kids 7-10")!.id,
      userId: manager.id,
      role: "manager" as const,
    },
    {
      groupId: groupByTitle.get("Sofia Kids 7-10")!.id,
      userId: coach1.id,
      role: "coach" as const,
    },
    ...insertedPlayers.slice(0, 12).map((player) => ({
      groupId: groupByTitle.get("Sofia Kids 7-10")!.id,
      playerId: player.id,
      role: "player" as const,
    })),
    {
      groupId: groupByTitle.get("Plovdiv Advanced Juniors")!.id,
      userId: manager.id,
      role: "manager" as const,
    },
    {
      groupId: groupByTitle.get("Plovdiv Advanced Juniors")!.id,
      userId: coach2.id,
      role: "coach" as const,
    },
    ...insertedPlayers.slice(12, 24).map((player) => ({
      groupId: groupByTitle.get("Plovdiv Advanced Juniors")!.id,
      playerId: player.id,
      role: "player" as const,
    })),
    {
      groupId: groupByTitle.get("Varna Beginners")!.id,
      userId: manager.id,
      role: "manager" as const,
    },
    {
      groupId: groupByTitle.get("Varna Beginners")!.id,
      userId: coach1.id,
      role: "coach" as const,
    },
    ...insertedPlayers.slice(4, 18).map((player) => ({
      groupId: groupByTitle.get("Varna Beginners")!.id,
      playerId: player.id,
      role: "player" as const,
    })),
    {
      groupId: groupByTitle.get("Sofia Social Adults")!.id,
      userId: manager.id,
      role: "manager" as const,
    },
    {
      groupId: groupByTitle.get("Sofia Social Adults")!.id,
      userId: coach2.id,
      role: "coach" as const,
    },
    ...adultUsers.map((user) => ({
      groupId: groupByTitle.get("Sofia Social Adults")!.id,
      userId: user.id,
      role: "parent" as const,
    })),
  ];

  await db.insert(groupMembers).values(groupMemberRows);

  const insertedInvitations = await db
    .insert(groupInvitations)
    .values([
      {
        groupId: groupByTitle.get("Sofia Kids 7-10")!.id,
        inviteCode: "SOFIA-KIDS-2026",
        userId: parents[0].id,
        usedAt: new Date(),
      },
      {
        groupId: groupByTitle.get("Varna Beginners")!.id,
        inviteCode: "VARNA-BEGINNERS-2026",
      },
      {
        groupId: groupByTitle.get("Sofia Social Adults")!.id,
        inviteCode: "SOFIA-SOCIAL-2026",
        userId: adultUsers[0].id,
        usedAt: new Date(),
      },
    ])
    .returning();

  const today = new Date();
  const insertedSessions = await db
    .insert(sessions)
    .values([
      {
        groupId: groupByTitle.get("Sofia Kids 7-10")!.id,
        sessionDate: toDateOnly(addDays(today, 3)),
        startTime: "17:00",
        venueId: venueByName.get("Arena Sofia Hall")!.id,
        coachUserId: coach1.id,
        capacity: 16,
      },
      {
        groupId: groupByTitle.get("Plovdiv Advanced Juniors")!.id,
        sessionDate: toDateOnly(addDays(today, 5)),
        startTime: "18:30",
        venueId: venueByName.get("Plovdiv Sports Center")!.id,
        coachUserId: coach2.id,
        capacity: 16,
      },
      {
        groupId: groupByTitle.get("Varna Beginners")!.id,
        sessionDate: toDateOnly(addDays(today, 6)),
        startTime: "17:30",
        venueId: venueByName.get("Varna Sea Palace")!.id,
        coachUserId: coach1.id,
        capacity: 14,
      },
      {
        groupId: groupByTitle.get("Sofia Social Adults")!.id,
        sessionDate: toDateOnly(addDays(today, 7)),
        startTime: "19:00",
        venueId: venueByName.get("Arena Sofia Hall")!.id,
        coachUserId: coach2.id,
        capacity: 20,
      },
      {
        groupId: groupByTitle.get("Sofia Kids 7-10")!.id,
        sessionDate: toDateOnly(addDays(today, -20)),
        startTime: "17:00",
        venueId: venueByName.get("Arena Sofia Hall")!.id,
        coachUserId: coach1.id,
        capacity: 16,
      },
      {
        groupId: groupByTitle.get("Plovdiv Advanced Juniors")!.id,
        sessionDate: toDateOnly(addDays(today, -30)),
        startTime: "18:30",
        venueId: venueByName.get("Plovdiv Sports Center")!.id,
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
        note: "Confirmed for training.",
      },
      {
        sessionId: session.id,
        playerId: sessionPlayers[1].id,
        parentUserId: sessionPlayers[1].parentUserId,
        status: "absent",
        note: "Out of town this week.",
      },
      {
        sessionId: session.id,
        playerId: sessionPlayers[2].id,
        parentUserId: sessionPlayers[2].parentUserId,
        status: "maybe",
        note: "Will confirm by tomorrow.",
      },
    ]);

    await db.insert(sessionComments).values([
      {
        sessionId: session.id,
        userId: sessionIndex % 2 === 0 ? coach1.id : coach2.id,
        text: "Focus on footwork and clears during warm-up.",
      },
      {
        sessionId: session.id,
        userId: manager.id,
        text: "Please arrive 10 minutes early for court setup.",
      },
      {
        sessionId: session.id,
        userId: parents[sessionIndex % parents.length].id,
        text: "We will be a few minutes late due to traffic.",
      },
    ]);
  }

  const insertedEvents = await db
    .insert(events)
    .values([
      {
        title: "Sofia Junior Open",
        description: "Junior singles and doubles for club players.",
        venueId: venueByName.get("Arena Sofia Hall")!.id,
        eventDate: atLocalHour(addDays(today, 14), 10),
        capacity: 48,
      },
      {
        title: "Varna Summer Camp",
        description: "Weekend camp focused on footwork and endurance.",
        venueId: venueByName.get("Varna Sea Palace")!.id,
        eventDate: atLocalHour(addDays(today, 21), 11),
        capacity: 32,
      },
      {
        title: "Burgas Club Social Night",
        description: "Friendly doubles evening with light refreshments.",
        venueId: venueByName.get("Burgas Mladost Hall")!.id,
        eventDate: atLocalHour(addDays(today, 45), 9),
        capacity: 40,
      },
      {
        title: "Plovdiv Training Day",
        description: "Open training day for new players and families.",
        venueId: venueByName.get("Plovdiv Sports Center")!.id,
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
        groupId: groupByTitle.get("Sofia Kids 7-10")!.id,
        authorId: manager.id,
        title: "Season kickoff and gear check",
        content: "We start the new season next week. Please bring indoor shoes, a water bottle, and a light jacket for warm-up.",
      },
      {
        groupId: groupByTitle.get("Plovdiv Advanced Juniors")!.id,
        authorId: coach2.id,
        title: "Tournament prep week",
        content: "We will focus on match play and serve routines. Please review the tournament schedule in the events tab.",
      },
      {
        groupId: groupByTitle.get("Sofia Social Adults")!.id,
        authorId: coach2.id,
        title: "Social session full",
        content: "This week's social session is full. Please update your attendance if your plans change so we can offer spots.",
      },
    ])
    .returning();

  console.log(
    `Seeded ${insertedUsers.length} users, ${insertedPlayers.length} players, ${insertedGroups.length} groups, ${insertedSessions.length} sessions, ${insertedEvents.length} events, ${insertedAnnouncements.length} announcements, and ${insertedInvitations.length} invitations.`,
  );
}

main().catch((error) => {
  console.error("Database seed failed.");
  console.error(error);
  process.exit(1);
});
