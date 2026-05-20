# Badminton Club Planner

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111111)
![Expo](https://img.shields.io/badge/Expo-React%20Native-000020?logo=expo&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-Type%20Safe-C5F74F)
![Status](https://img.shields.io/badge/Capstone-Full%20Stack%20Apps%20with%20AI-6B7280)

Badminton Club Planner is a full-stack monorepo application for badminton clubs. It helps club staff manage training groups, training sessions, venues, attendance, comments, club events, coaches, parents, and players from one coordinated system.

The project contains a Next.js web application for club administration and coaching workflows, a REST API for mobile clients, a PostgreSQL database managed with Drizzle ORM, and an Expo React Native mobile app for parents and players. It was built as an educational capstone project for the **Full Stack Apps with AI** course.

The seeded database contains generated demonstration data for safe evaluation and walkthroughs. Demo names, events, groups, venues, attendance records, and comments are fictional.

## User Roles

| Role | Purpose |
| --- | --- |
| Visitor | Can view public entry points and register or sign in. |
| Registered User | Has an account and can access authenticated app areas. |
| Parent / Group Member | Views sessions, events, comments, announcements, and attendance for their players or groups. |
| Coach | Manages training sessions, attendance, and session communication. |
| Club Manager | Creates and manages groups, venues, sessions, invitations, events, and members. |
| Admin | Oversees platform data and administrative workflows. |

## Features

### Authentication

- Account registration and login.
- JWT-based authentication for REST API clients.
- Password hashing with bcrypt, with architecture support for argon2 if adopted later.
- Role-aware navigation and server-side authorization checks.

### Group Management

- Create and edit training groups.
- Assign venues, levels, and age ranges.
- Manage group members, coaches, managers, parents, and players.
- Generate group invitation links and invite codes.

### Sessions

- Schedule training sessions by group, venue, date, time, coach, and capacity.
- Display upcoming and past sessions.
- Support session cancellation and session detail views.
- Share session information with group members.

### Attendance

- Track attendance per player and session.
- Mark status as attending, absent, or maybe.
- Store parent notes and attendance timestamps.
- Expose attendance updates through web workflows and mobile API routes.

### Comments

- Add session comments for coordination between coaches, managers, and families.
- Display conversation history on session detail pages.
- Support REST API access for mobile session comments.

### Events

- Create, edit, list, cancel, and delete club events.
- Register users and players for events.
- Track registration status such as registered, waitlisted, or canceled.
- Connect events to venues and capacity limits.

### Mobile App

- Expo React Native app with Expo Router navigation.
- Parent-friendly screens for sessions, events, announcements, login, and registration.
- Secure token storage for authenticated API access.
- Configurable backend URL through `BADMINTON_API_URL`.

### REST API

- Mobile-oriented REST endpoints under the Next.js App Router.
- Bearer token authentication.
- Stable JSON error shape: `{ "error": { "message": "..." } }`.
- Endpoints for authentication, sessions, attendance, comments, events, and announcements.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend | Next.js route handlers, Server Actions, service/data helpers |
| Database | PostgreSQL hosted on Neon DB |
| ORM | Drizzle ORM and Drizzle Kit migrations |
| Mobile | Expo, React Native, Expo Router |
| Authentication | JWT Bearer tokens, secure cookies/session helpers, bcrypt password hashing |
| Deployment | Netlify for web/API and Expo web preview, Neon for PostgreSQL |

## Screenshots

### Web App

| Dashboard | Groups | Events |
| --- | --- | --- |
| Add screenshot: `docs/screenshots/web-dashboard.png` | Add screenshot: `docs/screenshots/web-groups.png` | Add screenshot: `docs/screenshots/web-events.png` |

### Mobile App

| Sessions | Session Details | Events |
| --- | --- | --- |
| Add screenshot: `docs/screenshots/mobile-sessions.png` | Add screenshot: `docs/screenshots/mobile-session-details.png` | Add screenshot: `docs/screenshots/mobile-events.png` |

## Live Demo

| Resource | URL |
| --- | --- |
| Web App and REST API | https://badminton-planner-web-may-2026.netlify.app |
| Mobile App Preview | https://badminton-planner-mobile-may-2026.netlify.app |
| API Docs | https://badminton-planner-web-may-2026.netlify.app/api/docs |
| GitHub Repository | https://github.com/Pavlin-Panev/badminton-planner |

The Netlify URLs above are capstone evaluation URLs. Replace them with the final deployed URLs before submission if the site names change.

## Demo Credentials

All seeded demo accounts use password `pass123`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@badminton.test` | `pass123` |
| Manager | `desislava.ivanova@badminton.test` | `pass123` |
| Coach | `georgi.stoyanov@badminton.test` | `pass123` |
| Coach | `petar.kolev@badminton.test` | `pass123` |
| Parent | `elena.dimitrova@badminton.test` | `pass123` |
| Parent | `ivan.mihaylov@badminton.test` | `pass123` |
| Parent | `silvia.vasileva@badminton.test` | `pass123` |

## Quick Start

```bash
npm install
npm run dev
```

For database configuration, migrations, seeding, deployment, and mobile networking setup, follow the full [local setup guide](docs/setup-guide.md) and [deployment guide](docs/deployment-guide.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Performance Test](docs/performance-test.md)
- [Repository Structure](docs/repo-structure.md)
- [Setup Guide](docs/setup-guide.md)
