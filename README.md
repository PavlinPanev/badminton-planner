# Badminton Planner

Badminton Planner is a full-stack club planning system for badminton clubs. It helps club managers create and organize groups, coaches manage sessions and attendance, and parents or players view upcoming sessions, mark attendance, and follow comments and events.

The project is organized as an npm workspace with a Next.js web app, an Expo mobile app, and a shared package for cross-app types and utilities.

- `badminton-web/`: Next.js web application and backend/API layer using React, Tailwind CSS, Neon Postgres, and Drizzle ORM.
- `badminton-mobile/`: Expo React Native app using Expo Router and the RESTful backend API with Bearer token authentication.
- `badminton-shared/`: shared types, constants, validation helpers, and framework-neutral utilities.

The web app supports club management and coaching workflows. The mobile app focuses on logged-in users viewing groups and sessions, marking attendance, and reading comments and events.
