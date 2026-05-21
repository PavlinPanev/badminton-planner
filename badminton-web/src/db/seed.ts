import "dotenv/config";
import bcrypt from "bcrypt";

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

const coreUsers = [
  { email: "admin@badminton.test", name: "Nikolay Petrov", role: "admin" as const },
  { email: "desislava.ivanova@badminton.test", name: "Desislava Ivanova", role: "manager" as const },
  { email: "georgi.stoyanov@badminton.test", name: "Georgi Stoyanov", role: "coach" as const },
  { email: "petar.kolev@badminton.test", name: "Petar Kolev", role: "coach" as const },
  { email: "maria.atanasova@badminton.test", name: "Maria Atanasova", role: "coach" as const },
  { email: "elena.dimitrova@badminton.test", name: "Elena Dimitrova", role: "parent" as const },
  { email: "ivan.mihaylov@badminton.test", name: "Ivan Mihaylov", role: "parent" as const },
  { email: "silvia.vasileva@badminton.test", name: "Silvia Vasileva", role: "parent" as const },
  { email: "kalina.marinova@badminton.test", name: "Kalina Marinova", role: "parent" as const },
  { email: "borislav.angelov@badminton.test", name: "Borislav Angelov", role: "parent" as const },
];

const socialPlayers = [
  { email: "ivaylo.georgiev@badminton.test", name: "Ivaylo Georgiev" },
  { email: "daniela.stoyanova@badminton.test", name: "Daniela Stoyanova" },
  { email: "radislav.petkov@badminton.test", name: "Radislav Petkov" },
  { email: "yoana.koleva@badminton.test", name: "Yoana Koleva" },
  { email: "vladimir.iliev@badminton.test", name: "Vladimir Iliev" },
  { email: "vesela.stefanova@badminton.test", name: "Vesela Stefanova" },
  { email: "plamen.rusev@badminton.test", name: "Plamen Rusev" },
  { email: "tanya.ivanova@badminton.test", name: "Tanya Ivanova" },
];

const playerSeed = [
  { name: "Aleksandar Petrov", birthYear: 2018, skillLevel: "beginner" as const, parentEmail: "elena.dimitrova@badminton.test" },
  { name: "Mila Dimitrova", birthYear: 2017, skillLevel: "beginner" as const, parentEmail: "elena.dimitrova@badminton.test" },
  { name: "Viktor Mihaylov", birthYear: 2016, skillLevel: "beginner" as const, parentEmail: "ivan.mihaylov@badminton.test" },
  { name: "Nia Mihaylova", birthYear: 2015, skillLevel: "intermediate" as const, parentEmail: "ivan.mihaylov@badminton.test" },
  { name: "Stefan Vasilev", birthYear: 2014, skillLevel: "intermediate" as const, parentEmail: "silvia.vasileva@badminton.test" },
  { name: "Radostina Vasileva", birthYear: 2013, skillLevel: "advanced" as const, parentEmail: "silvia.vasileva@badminton.test" },
  { name: "Kalin Marinov", birthYear: 2014, skillLevel: "intermediate" as const, parentEmail: "kalina.marinova@badminton.test" },
  { name: "Lora Marinova", birthYear: 2012, skillLevel: "advanced" as const, parentEmail: "kalina.marinova@badminton.test" },
  { name: "Boris Angelov", birthYear: 2011, skillLevel: "advanced" as const, parentEmail: "borislav.angelov@badminton.test" },
  { name: "Teodor Angelov", birthYear: 2009, skillLevel: "competitive" as const, parentEmail: "borislav.angelov@badminton.test" },
  { name: "Yana Kostova", birthYear: 2010, skillLevel: "competitive" as const, parentEmail: "elena.dimitrova@badminton.test" },
  { name: "Martin Hristov", birthYear: 2008, skillLevel: "competitive" as const, parentEmail: "ivan.mihaylov@badminton.test" },
  { name: "Simona Petrova", birthYear: 2016, skillLevel: "beginner" as const, parentEmail: "silvia.vasileva@badminton.test" },
  { name: "Daniel Kolev", birthYear: 2015, skillLevel: "beginner" as const, parentEmail: "kalina.marinova@badminton.test" },
  { name: "Preslava Ilieva", birthYear: 2013, skillLevel: "intermediate" as const, parentEmail: "borislav.angelov@badminton.test" },
  { name: "Nikola Rusev", birthYear: 2012, skillLevel: "advanced" as const, parentEmail: "elena.dimitrova@badminton.test" },
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

async function resetDatabase() {
  await db.delete(eventRegistrations);
  await db.delete(sessionComments);
  await db.delete(sessionAttendance);
  await db.delete(groupInvitations);
  await db.delete(groupAnnouncements);
  await db.delete(groupMembers);
  await db.delete(sessions);
  await db.delete(events);
  await db.delete(groups);
  await db.delete(players);
  await db.delete(users);
  await db.delete(venues);
}

async function main() {
  await resetDatabase();

  const passwordHash = await bcrypt.hash(password, 10);
  const insertedUsers = await db
    .insert(users)
    .values([
      ...coreUsers.map((user) => ({ ...user, passwordHash })),
      ...socialPlayers.map((user) => ({
        email: user.email,
        passwordHash,
        name: user.name,
        role: "parent" as const,
      })),
    ])
    .returning();

  const userByEmail = new Map(insertedUsers.map((user) => [user.email, user]));
  const admin = userByEmail.get("admin@badminton.test")!;
  const manager = userByEmail.get("desislava.ivanova@badminton.test")!;
  const coachGeorgi = userByEmail.get("georgi.stoyanov@badminton.test")!;
  const coachPetar = userByEmail.get("petar.kolev@badminton.test")!;
  const coachMaria = userByEmail.get("maria.atanasova@badminton.test")!;
  const parentUsers = coreUsers.filter((user) => user.role === "parent").map((user) => userByEmail.get(user.email)!);
  const socialUsers = socialPlayers.map((user) => userByEmail.get(user.email)!);

  const insertedPlayers = await db
    .insert(players)
    .values(
      playerSeed.map((player) => ({
        name: player.name,
        birthYear: player.birthYear,
        skillLevel: player.skillLevel,
        parentUserId: userByEmail.get(player.parentEmail)!.id,
      })),
    )
    .returning();

  const playerByName = new Map(insertedPlayers.map((player) => [player.name, player]));

  const insertedVenues = await db
    .insert(venues)
    .values([
      {
        name: "Sport Complex Akademik",
        address: "Stadion Akademik, Geo Milev, Slatina",
        city: "Sofia",
        description: "Main Sofia training base inspired by the Akademik area near Festivalna hall.",
      },
      {
        name: "Sport Center Chelopechene",
        address: "Chelopechene district",
        city: "Sofia",
        description: "Club tournament venue for junior rounds and weekend match play.",
      },
      {
        name: "Elin Pelin Municipal Hall",
        address: "1 Nezavisimost Square",
        city: "Elin Pelin",
        description: "Regional school hall for junior groups outside Sofia.",
      },
      {
        name: "Gorna Malina Sports Hall",
        address: "20 Hristo Botev Street",
        city: "Gorna Malina",
        description: "Local training hall used for beginners and family sessions.",
      },
      {
        name: "MMC Helios Primorsko",
        address: "International Youth Center Helios",
        city: "Primorsko",
        description: "Coastal camp base for summer training weeks and team building.",
      },
      {
        name: "Arena Sofia Practice Hall",
        address: "1 Asen Yordanov Blvd",
        city: "Sofia",
        description: "Large-capacity hall for showcases, finals, and open club days.",
      },
    ])
    .returning();

  const venueByName = new Map(insertedVenues.map((venue) => [venue.name, venue]));

  const insertedGroups = await db
    .insert(groups)
    .values([
      {
        title: "Sofia U11 Fundamentals",
        description: "First steps in grip, movement, service, and simple games for children under 11.",
        level: "beginner",
        minAge: 6,
        maxAge: 10,
        venueId: venueByName.get("Sport Complex Akademik")!.id,
      },
      {
        title: "Sofia U13 Development",
        description: "Structured drills for under-13 players preparing for club tour events.",
        level: "intermediate",
        minAge: 10,
        maxAge: 13,
        venueId: venueByName.get("Sport Center Chelopechene")!.id,
      },
      {
        title: "Junior Competitive 14-19",
        description: "Match-focused squad for advanced teenagers competing in singles and doubles.",
        level: "competitive",
        minAge: 14,
        maxAge: 19,
        venueId: venueByName.get("Arena Sofia Practice Hall")!.id,
      },
      {
        title: "Elin Pelin Beginners",
        description: "Regional children group with light technical work and parent-friendly scheduling.",
        level: "beginner",
        minAge: 7,
        maxAge: 12,
        venueId: venueByName.get("Elin Pelin Municipal Hall")!.id,
      },
      {
        title: "Gorna Malina Family Badminton",
        description: "Mixed family sessions for children and parents who want relaxed doubles play.",
        level: "intermediate",
        minAge: 10,
        venueId: venueByName.get("Gorna Malina Sports Hall")!.id,
      },
      {
        title: "Social Badminton Sofia",
        description: "Adult evening group for recreational players, parents, and returning athletes.",
        level: "intermediate",
        minAge: 18,
        venueId: venueByName.get("Sport Complex Akademik")!.id,
      },
    ])
    .returning();

  const groupByTitle = new Map(insertedGroups.map((group) => [group.title, group]));
  const groupMemberRows = [
    ...insertedGroups.map((group) => ({
      groupId: group.id,
      userId: admin.id,
      role: "manager" as const,
    })),
    { groupId: groupByTitle.get("Sofia U11 Fundamentals")!.id, userId: manager.id, role: "manager" as const },
    { groupId: groupByTitle.get("Sofia U11 Fundamentals")!.id, userId: coachGeorgi.id, role: "coach" as const },
    ...["Aleksandar Petrov", "Mila Dimitrova", "Viktor Mihaylov", "Simona Petrova", "Daniel Kolev"].map((name) => ({
      groupId: groupByTitle.get("Sofia U11 Fundamentals")!.id,
      playerId: playerByName.get(name)!.id,
      role: "player" as const,
    })),
    { groupId: groupByTitle.get("Sofia U13 Development")!.id, userId: manager.id, role: "manager" as const },
    { groupId: groupByTitle.get("Sofia U13 Development")!.id, userId: coachMaria.id, role: "coach" as const },
    ...["Nia Mihaylova", "Stefan Vasilev", "Kalin Marinov", "Lora Marinova", "Preslava Ilieva", "Nikola Rusev"].map((name) => ({
      groupId: groupByTitle.get("Sofia U13 Development")!.id,
      playerId: playerByName.get(name)!.id,
      role: "player" as const,
    })),
    { groupId: groupByTitle.get("Junior Competitive 14-19")!.id, userId: manager.id, role: "manager" as const },
    { groupId: groupByTitle.get("Junior Competitive 14-19")!.id, userId: coachPetar.id, role: "coach" as const },
    ...["Radostina Vasileva", "Boris Angelov", "Teodor Angelov", "Yana Kostova", "Martin Hristov"].map((name) => ({
      groupId: groupByTitle.get("Junior Competitive 14-19")!.id,
      playerId: playerByName.get(name)!.id,
      role: "player" as const,
    })),
    { groupId: groupByTitle.get("Elin Pelin Beginners")!.id, userId: coachGeorgi.id, role: "coach" as const },
    ...["Aleksandar Petrov", "Viktor Mihaylov", "Simona Petrova", "Daniel Kolev"].map((name) => ({
      groupId: groupByTitle.get("Elin Pelin Beginners")!.id,
      playerId: playerByName.get(name)!.id,
      role: "player" as const,
    })),
    { groupId: groupByTitle.get("Gorna Malina Family Badminton")!.id, userId: coachMaria.id, role: "coach" as const },
    ...parentUsers.slice(0, 4).map((user) => ({
      groupId: groupByTitle.get("Gorna Malina Family Badminton")!.id,
      userId: user.id,
      role: "parent" as const,
    })),
    { groupId: groupByTitle.get("Social Badminton Sofia")!.id, userId: coachPetar.id, role: "coach" as const },
    ...socialUsers.map((user) => ({
      groupId: groupByTitle.get("Social Badminton Sofia")!.id,
      userId: user.id,
      role: "parent" as const,
    })),
  ];

  await db.insert(groupMembers).values(groupMemberRows);

  const insertedInvitations = await db
    .insert(groupInvitations)
    .values([
      {
        groupId: groupByTitle.get("Sofia U11 Fundamentals")!.id,
        inviteCode: "SOFIA-U11-OPEN-2026",
        userId: parentUsers[0].id,
        usedAt: new Date(),
      },
      {
        groupId: groupByTitle.get("Sofia U13 Development")!.id,
        inviteCode: "SOFIA-U13-TRIAL-2026",
      },
      {
        groupId: groupByTitle.get("Junior Competitive 14-19")!.id,
        inviteCode: "JUNIOR-COMP-2026",
      },
      {
        groupId: groupByTitle.get("Social Badminton Sofia")!.id,
        inviteCode: "SOCIAL-SOFIA-THU",
        userId: socialUsers[0].id,
        usedAt: new Date(),
      },
      {
        groupId: groupByTitle.get("Gorna Malina Family Badminton")!.id,
        inviteCode: "GORNA-MALINA-FAMILY",
      },
    ])
    .returning();

  const today = new Date();
  const insertedSessions = await db
    .insert(sessions)
    .values([
      {
        groupId: groupByTitle.get("Sofia U11 Fundamentals")!.id,
        sessionDate: toDateOnly(addDays(today, 2)),
        startTime: "17:00",
        venueId: venueByName.get("Sport Complex Akademik")!.id,
        coachUserId: coachGeorgi.id,
        capacity: 18,
      },
      {
        groupId: groupByTitle.get("Sofia U13 Development")!.id,
        sessionDate: toDateOnly(addDays(today, 3)),
        startTime: "18:00",
        venueId: venueByName.get("Sport Center Chelopechene")!.id,
        coachUserId: coachMaria.id,
        capacity: 16,
      },
      {
        groupId: groupByTitle.get("Junior Competitive 14-19")!.id,
        sessionDate: toDateOnly(addDays(today, 4)),
        startTime: "19:00",
        venueId: venueByName.get("Arena Sofia Practice Hall")!.id,
        coachUserId: coachPetar.id,
        capacity: 14,
      },
      {
        groupId: groupByTitle.get("Elin Pelin Beginners")!.id,
        sessionDate: toDateOnly(addDays(today, 5)),
        startTime: "16:30",
        venueId: venueByName.get("Elin Pelin Municipal Hall")!.id,
        coachUserId: coachGeorgi.id,
        capacity: 14,
      },
      {
        groupId: groupByTitle.get("Gorna Malina Family Badminton")!.id,
        sessionDate: toDateOnly(addDays(today, 6)),
        startTime: "10:00",
        venueId: venueByName.get("Gorna Malina Sports Hall")!.id,
        coachUserId: coachMaria.id,
        capacity: 20,
      },
      {
        groupId: groupByTitle.get("Social Badminton Sofia")!.id,
        sessionDate: toDateOnly(addDays(today, 7)),
        startTime: "20:00",
        venueId: venueByName.get("Sport Complex Akademik")!.id,
        coachUserId: coachPetar.id,
        capacity: 24,
      },
      {
        groupId: groupByTitle.get("Sofia U13 Development")!.id,
        sessionDate: toDateOnly(addDays(today, -6)),
        startTime: "18:00",
        venueId: venueByName.get("Sport Center Chelopechene")!.id,
        coachUserId: coachMaria.id,
        capacity: 16,
      },
      {
        groupId: groupByTitle.get("Junior Competitive 14-19")!.id,
        sessionDate: toDateOnly(addDays(today, -12)),
        startTime: "19:00",
        venueId: venueByName.get("Arena Sofia Practice Hall")!.id,
        coachUserId: coachPetar.id,
        capacity: 14,
      },
      {
        groupId: groupByTitle.get("Social Badminton Sofia")!.id,
        sessionDate: toDateOnly(addDays(today, -2)),
        startTime: "20:00",
        venueId: venueByName.get("Sport Complex Akademik")!.id,
        coachUserId: coachPetar.id,
        capacity: 24,
        canceled: true,
      },
    ])
    .returning();

  for (const [index, session] of insertedSessions.entries()) {
    const player = insertedPlayers[index % insertedPlayers.length];
    const secondPlayer = insertedPlayers[(index + 5) % insertedPlayers.length];
    const thirdPlayer = insertedPlayers[(index + 9) % insertedPlayers.length];

    await db.insert(sessionAttendance).values([
      {
        sessionId: session.id,
        playerId: player.id,
        parentUserId: player.parentUserId,
        status: "attending",
        note: "Confirmed in the mobile app.",
      },
      {
        sessionId: session.id,
        playerId: secondPlayer.id,
        parentUserId: secondPlayer.parentUserId,
        status: index % 3 === 0 ? "maybe" : "attending",
        note: index % 3 === 0 ? "Waiting on school schedule." : "Can help with warm-up setup.",
      },
      {
        sessionId: session.id,
        playerId: thirdPlayer.id,
        parentUserId: thirdPlayer.parentUserId,
        status: index % 2 === 0 ? "absent" : "attending",
        note: index % 2 === 0 ? "Family travel this week." : "Needs loan racket.",
      },
    ]);

    await db.insert(sessionComments).values([
      {
        sessionId: session.id,
        userId: index % 2 === 0 ? coachGeorgi.id : coachMaria.id,
        text: "Plan: short footwork ladder, serve targets, then controlled games.",
      },
      {
        sessionId: session.id,
        userId: manager.id,
        text: "Please update attendance by noon so court allocation stays accurate.",
      },
      {
        sessionId: session.id,
        userId: parentUsers[index % parentUsers.length].id,
        text: "Thanks, attendance is updated for our player.",
      },
    ]);
  }

  const insertedEvents = await db
    .insert(events)
    .values([
      {
        title: "Racket Speed Tour 2026 - Round 4",
        description: "Club tour round for U11, U13, and 14-19 players with singles and optional parent-child doubles.",
        venueId: venueByName.get("Sport Center Chelopechene")!.id,
        eventDate: atLocalHour(addDays(today, 31), 9),
        capacity: 64,
      },
      {
        title: "Racket Speed Tour 2026 - Round 5",
        description: "Autumn club ranking event with medal ceremonies for all age brackets.",
        venueId: venueByName.get("Sport Complex Akademik")!.id,
        eventDate: atLocalHour(addDays(today, 108), 9),
        capacity: 64,
      },
      {
        title: "Summer Sports Camp 2026 - Primorsko",
        description: "Seven-day camp at MMC Helios focused on movement, confidence, beach conditioning, and team habits.",
        venueId: venueByName.get("MMC Helios Primorsko")!.id,
        eventDate: atLocalHour(addDays(today, 47), 10),
        capacity: 40,
      },
      {
        title: "Family Doubles Sunday",
        description: "Friendly parent-child doubles morning for families from Sofia, Elin Pelin, and Gorna Malina.",
        venueId: venueByName.get("Gorna Malina Sports Hall")!.id,
        eventDate: atLocalHour(addDays(today, 17), 10),
        capacity: 32,
      },
      {
        title: "Open Club Day - Slatina",
        description: "Introductory day for new families with short assessments and club orientation.",
        venueId: venueByName.get("Sport Complex Akademik")!.id,
        eventDate: atLocalHour(addDays(today, 10), 11),
        capacity: 50,
      },
      {
        title: "Canceled Shuttle Control Workshop",
        description: "Workshop kept in the data so reviewers can see canceled event handling.",
        venueId: venueByName.get("Arena Sofia Practice Hall")!.id,
        eventDate: atLocalHour(addDays(today, 24), 18),
        capacity: 18,
        canceled: true,
      },
    ])
    .returning();

  await db.insert(eventRegistrations).values([
    { eventId: insertedEvents[0].id, userId: parentUsers[0].id, playerId: playerByName.get("Aleksandar Petrov")!.id, status: "registered" },
    { eventId: insertedEvents[0].id, userId: parentUsers[1].id, playerId: playerByName.get("Nia Mihaylova")!.id, status: "registered" },
    { eventId: insertedEvents[0].id, userId: parentUsers[4].id, playerId: playerByName.get("Teodor Angelov")!.id, status: "waitlisted" },
    { eventId: insertedEvents[1].id, userId: parentUsers[2].id, playerId: playerByName.get("Radostina Vasileva")!.id, status: "registered" },
    { eventId: insertedEvents[2].id, userId: parentUsers[3].id, playerId: playerByName.get("Lora Marinova")!.id, status: "registered" },
    { eventId: insertedEvents[2].id, userId: parentUsers[4].id, playerId: playerByName.get("Boris Angelov")!.id, status: "registered" },
    { eventId: insertedEvents[3].id, userId: parentUsers[0].id, playerId: playerByName.get("Mila Dimitrova")!.id, status: "registered" },
    { eventId: insertedEvents[3].id, userId: socialUsers[0].id, status: "registered" },
    { eventId: insertedEvents[4].id, userId: manager.id, status: "registered" },
    { eventId: insertedEvents[4].id, userId: admin.id, status: "registered" },
    { eventId: insertedEvents[5].id, userId: parentUsers[1].id, playerId: playerByName.get("Viktor Mihaylov")!.id, status: "canceled" },
  ]);

  const insertedAnnouncements = await db
    .insert(groupAnnouncements)
    .values([
      {
        groupId: groupByTitle.get("Sofia U11 Fundamentals")!.id,
        authorId: coachGeorgi.id,
        title: "Bring clean indoor shoes for Akademik",
        content: "This week we are checking grips and indoor shoes before training. New players can borrow rackets from the club bag.",
      },
      {
        groupId: groupByTitle.get("Sofia U13 Development")!.id,
        authorId: coachMaria.id,
        title: "Tour round preparation at Chelopechene",
        content: "The next two sessions will include singles scoring, short serve routines, and doubles rotation for parent-child pairs.",
      },
      {
        groupId: groupByTitle.get("Junior Competitive 14-19")!.id,
        authorId: coachPetar.id,
        title: "Competitive squad match video review",
        content: "Players should bring notes from their last match. We will review first-three-shot choices before court work.",
      },
      {
        groupId: groupByTitle.get("Elin Pelin Beginners")!.id,
        authorId: manager.id,
        title: "Regional group schedule confirmed",
        content: "The Elin Pelin group keeps its Friday slot. Parents can use the group invitation code for new registrations.",
      },
      {
        groupId: groupByTitle.get("Gorna Malina Family Badminton")!.id,
        authorId: coachMaria.id,
        title: "Family Doubles Sunday sign-up",
        content: "Please register through Events if you plan to join the family doubles morning. We will pair new families on arrival.",
      },
      {
        groupId: groupByTitle.get("Social Badminton Sofia")!.id,
        authorId: coachPetar.id,
        title: "Social badminton courts are capped",
        content: "Thursday social play is limited to 24 people. Update attendance early so the waiting list can move.",
      },
      {
        groupId: groupByTitle.get("Junior Competitive 14-19")!.id,
        authorId: manager.id,
        title: "Summer camp deposits and travel plan",
        content: "Camp registrations for Primorsko are open. Families should confirm transport needs before the end of the month.",
      },
    ])
    .returning();

  console.log(
    `Seeded ${insertedUsers.length} users, ${insertedPlayers.length} players, ${insertedVenues.length} venues, ${insertedGroups.length} groups, ${insertedSessions.length} sessions, ${insertedEvents.length} events, ${insertedAnnouncements.length} announcements, and ${insertedInvitations.length} invitations.`,
  );
}

main().catch((error) => {
  console.error("Database seed failed.");
  console.error(error);
  process.exit(1);
});
