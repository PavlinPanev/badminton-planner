# Badminton Club Planner

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-React%20Native-000020?logo=expo&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle%20ORM-Modern-0c0c0c)

Badminton Club Planner is a full-stack monorepo application for managing badminton club operations. It helps clubs organize training groups, schedule sessions, track attendance and comments, manage venues, and publish club events. The project is an educational capstone for the “Full Stack Apps with AI” course and includes generated demo data for safe testing.

**Target users**
- Visitor
- Registered User
- Parent / Group Member
- Coach
- Club Manager
- Admin

## Features

**Authentication**
- JWT-based login and registration
- Role-aware access for managers, coaches, parents, and admins

**Group Management**
- Create and manage training groups
- Assign coaches and manage member roles
- Invitation links for joining groups

**Sessions**
- Schedule training sessions with venue, coach, and capacity
- View upcoming, current, and past sessions

**Attendance**
- Mark attendance as attending, absent, or maybe
- Capture quick attendance notes

**Comments**
- Session comments for coordination and reminders

**Events**
- Manage club events and public registrations

**Mobile App**
- Session list, attendance, events, announcements
- Optimized for parents and group members

**REST API**
- Mobile-first REST endpoints for sessions, events, and announcements

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Next.js App Router, Server Actions, REST API |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Mobile | Expo, React Native, Expo Router |
| Auth | JWT, bcrypt/argon2 |
| Deployment | Vercel (web), Expo (mobile), Neon (DB) |

## Screenshots

**Web App**
- _Placeholder: dashboard_  
- _Placeholder: group detail_  
- _Placeholder: events_  

**Mobile App**
- _Placeholder: sessions list_  
- _Placeholder: announcements_  
- _Placeholder: events_  

## Live Demo

- Web App URL: _TBD_
- Mobile App URL: _TBD_
- GitHub Repo URL: _TBD_

## Demo Credentials

- Email: demo@badminton.test
- Password: pass123

## Quick Start

See the full setup instructions in [docs/setup-guide.md](docs/setup-guide.md).

## Documentation

- [docs/architecture.md](docs/architecture.md)
- [docs/database-schema.md](docs/database-schema.md)
- [docs/repo-structure.md](docs/repo-structure.md)
- [docs/setup-guide.md](docs/setup-guide.md)
