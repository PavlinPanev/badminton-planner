import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "coach", "parent"]);
export const skillLevelEnum = pgEnum("skill_level", [
  "beginner",
  "intermediate",
  "advanced",
  "competitive",
]);
export const groupLevelEnum = pgEnum("group_level", [
  "beginner",
  "intermediate",
  "advanced",
  "competitive",
]);
export const groupMemberRoleEnum = pgEnum("group_member_role", [
  "manager",
  "coach",
  "parent",
  "player",
]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "attending",
  "absent",
  "maybe",
]);
export const eventRegistrationStatusEnum = pgEnum("event_registration_status", [
  "registered",
  "waitlisted",
  "canceled",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    role: userRoleEnum("role").notNull().default("parent"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const players = pgTable(
  "players",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    birthYear: integer("birth_year").notNull(),
    skillLevel: skillLevelEnum("skill_level").notNull().default("beginner"),
    parentUserId: integer("parent_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("players_parent_user_id_idx").on(table.parentUserId),
    check("players_birth_year_range", sql`${table.birthYear} between 1900 and 2100`),
  ],
);

export const venues = pgTable(
  "venues",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("venues_city_idx").on(table.city)],
);

export const groups = pgTable(
  "groups",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    level: groupLevelEnum("level").notNull().default("beginner"),
    minAge: integer("min_age"),
    maxAge: integer("max_age"),
    venueId: integer("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("groups_venue_id_idx").on(table.venueId),
    check(
      "groups_age_range_valid",
      sql`${table.minAge} is null or ${table.maxAge} is null or ${table.minAge} <= ${table.maxAge}`,
    ),
  ],
);

export const groupMembers = pgTable(
  "group_members",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    playerId: integer("player_id").references(() => players.id, { onDelete: "cascade" }),
    role: groupMemberRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("group_members_group_id_idx").on(table.groupId),
    index("group_members_user_id_idx").on(table.userId),
    index("group_members_player_id_idx").on(table.playerId),
    uniqueIndex("group_members_group_user_idx").on(table.groupId, table.userId),
    uniqueIndex("group_members_group_player_idx").on(table.groupId, table.playerId),
    check("group_members_has_user_or_player", sql`${table.userId} is not null or ${table.playerId} is not null`),
  ],
);

export const groupInvitations = pgTable(
  "group_invitations",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    inviteCode: varchar("invite_code", { length: 96 }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("group_invitations_invite_code_idx").on(table.inviteCode),
    index("group_invitations_group_id_idx").on(table.groupId),
    index("group_invitations_user_id_idx").on(table.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    sessionDate: date("session_date").notNull(),
    startTime: time("start_time").notNull(),
    venueId: integer("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "restrict" }),
    coachUserId: integer("coach_user_id").references(() => users.id, { onDelete: "set null" }),
    capacity: integer("capacity"),
    canceled: boolean("canceled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sessions_group_id_idx").on(table.groupId),
    index("sessions_session_date_idx").on(table.sessionDate),
    index("sessions_venue_id_idx").on(table.venueId),
    index("sessions_coach_user_id_idx").on(table.coachUserId),
    check("sessions_capacity_positive", sql`${table.capacity} is null or ${table.capacity} > 0`),
  ],
);

export const sessionAttendance = pgTable(
  "session_attendance",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    parentUserId: integer("parent_user_id").references(() => users.id, { onDelete: "set null" }),
    status: attendanceStatusEnum("status").notNull(),
    note: text("note"),
    markedAt: timestamp("marked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("session_attendance_session_player_idx").on(table.sessionId, table.playerId),
    index("session_attendance_parent_user_id_idx").on(table.parentUserId),
  ],
);

export const sessionComments = pgTable(
  "session_comments",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commentedAt: timestamp("commented_at", { withTimezone: true }).notNull().defaultNow(),
    text: text("text").notNull(),
  },
  (table) => [
    index("session_comments_session_id_idx").on(table.sessionId),
    index("session_comments_user_id_idx").on(table.userId),
  ],
);

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    venueId: integer("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "restrict" }),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    capacity: integer("capacity"),
    canceled: boolean("canceled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("events_venue_id_idx").on(table.venueId),
    index("events_event_date_idx").on(table.eventDate),
    check("events_capacity_positive", sql`${table.capacity} is null or ${table.capacity} > 0`),
  ],
);

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    playerId: integer("player_id").references(() => players.id, { onDelete: "cascade" }),
    status: eventRegistrationStatusEnum("status").notNull().default("registered"),
    registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("event_registrations_event_id_idx").on(table.eventId),
    index("event_registrations_user_id_idx").on(table.userId),
    index("event_registrations_player_id_idx").on(table.playerId),
    uniqueIndex("event_registrations_event_user_player_idx").on(
      table.eventId,
      table.userId,
      table.playerId,
    ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  players: many(players),
  coachedSessions: many(sessions),
  groupMemberships: many(groupMembers),
  groupInvitations: many(groupInvitations),
  attendanceMarks: many(sessionAttendance),
  sessionComments: many(sessionComments),
  eventRegistrations: many(eventRegistrations),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  parentUser: one(users, {
    fields: [players.parentUserId],
    references: [users.id],
  }),
  groupMemberships: many(groupMembers),
  attendance: many(sessionAttendance),
  eventRegistrations: many(eventRegistrations),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  groups: many(groups),
  sessions: many(sessions),
  events: many(events),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  venue: one(venues, {
    fields: [groups.venueId],
    references: [venues.id],
  }),
  members: many(groupMembers),
  invitations: many(groupInvitations),
  sessions: many(sessions),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
  player: one(players, {
    fields: [groupMembers.playerId],
    references: [players.id],
  }),
}));

export const groupInvitationsRelations = relations(groupInvitations, ({ one }) => ({
  group: one(groups, {
    fields: [groupInvitations.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupInvitations.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  group: one(groups, {
    fields: [sessions.groupId],
    references: [groups.id],
  }),
  venue: one(venues, {
    fields: [sessions.venueId],
    references: [venues.id],
  }),
  coach: one(users, {
    fields: [sessions.coachUserId],
    references: [users.id],
  }),
  attendance: many(sessionAttendance),
  comments: many(sessionComments),
}));

export const sessionAttendanceRelations = relations(sessionAttendance, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionAttendance.sessionId],
    references: [sessions.id],
  }),
  player: one(players, {
    fields: [sessionAttendance.playerId],
    references: [players.id],
  }),
  parent: one(users, {
    fields: [sessionAttendance.parentUserId],
    references: [users.id],
  }),
}));

export const sessionCommentsRelations = relations(sessionComments, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionComments.sessionId],
    references: [sessions.id],
  }),
  user: one(users, {
    fields: [sessionComments.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  venue: one(venues, {
    fields: [events.venueId],
    references: [venues.id],
  }),
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
  player: one(players, {
    fields: [eventRegistrations.playerId],
    references: [players.id],
  }),
}));
