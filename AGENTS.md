# Badminton Planner Agent Instructions

## Project Description

Badminton Planner is a full-stack club planning system for badminton clubs, with web tools for club managers and coaches plus a mobile app for parents and players.

## Architecture and Technology Stack

- Root workspace: npm workspaces coordinating the web and mobile apps.
- `badminton-web/`: Next.js web app for administration, coaching workflows, REST API routes, authentication, and database access.
- `badminton-mobile/`: Expo React Native app for mobile session viewing, attendance, comments, and event interactions.
- `badminton-shared/`: shared types, constants, validation helpers, and cross-app utilities when useful.
- Database: Neon Postgres accessed through Drizzle ORM from the backend.
- API style: RESTful endpoints consumed by the mobile app and, when useful, by client-side web features.

## Folder Structure

- Keep web-only code inside `badminton-web/`.
- Keep mobile-only code inside `badminton-mobile/`.
- Put shared TypeScript types and framework-neutral helpers in `badminton-shared/`.
- Keep database schema, migrations, repositories, and server services in the web/backend app unless a dedicated backend package is added later.
- Avoid duplicating business rules between apps; extract stable shared rules into `badminton-shared/`.

## General Development Guidelines

- Prefer clear, modular code over broad abstractions.
- Preserve existing project conventions before introducing new patterns.
- Keep business logic in services or repositories rather than directly in UI components.
- Use TypeScript types consistently across app boundaries.
- Add focused tests or validation checks when changing shared behavior, authentication, database access, or API contracts.

## UI Guidelines

- Build modern, responsive, accessible interfaces for club operations.
- Prioritize practical workflows: scanning upcoming sessions, updating attendance, viewing comments, and managing groups.
- Use consistent spacing, typography, colors, and component patterns within each app.
- Design for real users: club managers need control and overview, coaches need fast session actions, and parents need simple session and attendance flows.

## Pages and Navigation Guidelines

- Web app pages should support manager and coach workflows: dashboard, groups, sessions, attendance, comments, events, and account/auth pages.
- Mobile app navigation should focus on logged-in users viewing groups, sessions, attendance actions, comments, and events.
- Keep protected pages behind authentication checks.
- Make role-specific navigation obvious and avoid exposing actions the current user cannot perform.

## Backend and Database Guidelines

- Use Neon Postgres as the source of truth.
- Use Drizzle ORM for schema definitions, migrations, and typed database queries.
- Keep database access behind repository or service-layer functions.
- Validate incoming API input before it reaches persistence logic.
- Return stable REST responses with predictable status codes and error shapes.
- Avoid leaking database details, stack traces, or internal identifiers that are not part of the product contract.

## Authentication and Authorization Guidelines

- Require authentication for user-specific groups, sessions, attendance, comments, and events.
- Use Bearer token authentication for API calls from the mobile app.
- Enforce authorization on the server, not only in the UI.
- Model role-based behavior clearly: club managers create and manage groups, coaches manage sessions, and parents view sessions and mark attendance.
- Never trust client-provided role or ownership claims without verifying them server-side.
