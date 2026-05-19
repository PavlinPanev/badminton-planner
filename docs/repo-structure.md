# Repository Structure

## Monorepo Overview

Badminton Club Planner is organized as a monorepo so the web app, mobile app, shared TypeScript code, and documentation can evolve together.

```text
badminton-club-planner/
├── badminton-web/
│   ├── drizzle/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── dashboard/
│   │   │   ├── events/
│   │   │   ├── groups/
│   │   │   ├── sessions/
│   │   │   ├── venues/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   ├── components/
│   │   ├── db/
│   │   └── lib/
│   ├── drizzle.config.ts
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── badminton-mobile/
│   ├── scripts/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── lib/
│   │   └── theme/
│   ├── app.config.js
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── badminton-shared/
│   └── src/
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   ├── deployment-guide.md
│   ├── repo-structure.md
│   └── setup-guide.md
├── scripts/
├── package.json
├── package-lock.json
└── README.md
```

## Root Files

| Path | Purpose |
| --- | --- |
| `package.json` | Root workspace configuration and monorepo scripts. |
| `package-lock.json` | Locked dependency graph for repeatable installs. |
| `README.md` | GitHub landing page for evaluators, recruiters, and developers. |
| `AGENTS.md` | Agent and project guidance for development workflows. |
| `.gitignore` | Ignored local files, build outputs, and environment files. |
| `docs/` | Project documentation. |

## npm Workspaces

The root `package.json` configures npm workspaces for:

```json
{
  "workspaces": [
    "badminton-web",
    "badminton-mobile",
    "badminton-shared"
  ]
}
```

This allows dependencies to be installed from the root with:

```bash
npm install
```

Workspace scripts can be run from the root:

```bash
npm run dev --workspace badminton-web
npm run dev --workspace badminton-mobile
```

The root `npm run dev` command starts both workspace development servers concurrently.

## `badminton-web/`

The `badminton-web` package contains the Next.js web application and backend.

| Path | Purpose |
| --- | --- |
| `src/app` | Next.js App Router pages, layouts, route groups, and API routes. |
| `src/app/api` | REST API route handlers for mobile and API clients. |
| `src/auth` | Authentication actions, API auth, session helpers, and JWT token utilities. |
| `src/components` | Shared web UI components such as headers, stat cards, session cards, and UI surfaces. |
| `src/db` | Drizzle schema, database client, and seed script. |
| `src/lib` | Domain data helpers for groups, sessions, venues, events, and session status. |
| `drizzle.config.ts` | Drizzle Kit configuration for migrations. |
| `.env.example` | Example web/backend environment variables for local and Netlify setup. |
| `package.json` | Next.js, Drizzle, lint, build, and database scripts. |

### `src/app`

`src/app` uses the Next.js App Router and contains web routes for:

- Dashboard
- Profile/settings
- Admin dashboard and user management
- Groups
- Group members
- Group announcements
- Group invitations
- Sessions
- Venues
- Events
- Login and registration

Pages are organized by route segments. Server Actions live near the pages that use them, for example `groups/actions.ts`, `groups/session-actions.ts`, `venues/actions.ts`, and `events/actions.ts`.

### `src/app/api`

The API routes expose mobile-friendly JSON endpoints. Current route groups include:

- `api/auth/login`
- `api/auth/register`
- `api/sessions`
- `api/sessions/[id]`
- `api/sessions/[id]/attendance`
- `api/sessions/[id]/comments`
- `api/events`
- `api/events/[id]`
- `api/events/[id]/register`
- `api/events/[id]/cancel-registration`
- `api/announcements`
- `api/docs`

Protected endpoints should validate Bearer tokens and enforce authorization server-side.

### `src/db`

`src/db` is the persistence boundary.

| File | Purpose |
| --- | --- |
| `schema.ts` | Drizzle table definitions, enums, indexes, constraints, and relations. |
| `index.ts` | Neon connection and typed Drizzle database export. |
| `seed.ts` | Generated demo data for users, players, venues, groups, sessions, attendance, comments, events, announcements, and invitations. |
| `seed-performance.ts` | Large non-production performance dataset seed for scalability checks. |

### `src/lib`

`src/lib` contains reusable data helpers and domain logic. These helpers keep query composition and business-oriented read models out of UI components and route handlers.

### `src/components`

Reusable web components live here. Components should remain presentational where possible and receive already-authorized data from pages, actions, or helper functions.

## `badminton-mobile/`

The `badminton-mobile` package contains the Expo React Native app.

| Path | Purpose |
| --- | --- |
| `src/app` | Expo Router screens for login, registration, home, groups, group details, sessions, session details, announcements, events, event details, and account. |
| `src/auth` | Auth context and token storage. |
| `src/components` | Mobile cards and UI primitives. |
| `src/lib/api.ts` | API base URL helper and API error handling. |
| `src/theme` | Mobile theme values. |
| `src/assets` | App icons, splash images, and other bundled assets. |
| `app.config.js` | Reads `BADMINTON_API_URL` and exposes it to the Expo runtime. |
| `app.json` | Expo app metadata. |
| `.env.example` | Example mobile API URL configuration. |

## `badminton-shared/`

`badminton-shared` is reserved for shared, framework-neutral TypeScript code. Good candidates include:

- API response types.
- Role and status constants.
- Validation schemas that do not depend on Next.js or React Native.
- Date, attendance, and session formatting helpers.
- Business rules that must stay consistent across web and mobile.

Shared code should avoid importing web-only or mobile-only dependencies.

## `docs/`

| File | Purpose |
| --- | --- |
| `architecture.md` | System design, communication flows, and Mermaid diagrams. |
| `database-schema.md` | Database tables, relationships, ERD, indexes, and constraints. |
| `deployment-guide.md` | Netlify, Neon, environment variable, and mobile export deployment guide. |
| `repo-structure.md` | Monorepo layout and folder responsibilities. |
| `setup-guide.md` | Local development setup, environment variables, database setup, and troubleshooting. |

## Configuration Files

| File | Purpose |
| --- | --- |
| `badminton-web/drizzle.config.ts` | Migration generation and database connection for Drizzle Kit. |
| `badminton-web/next.config.ts` | Next.js configuration. |
| `badminton-web/eslint.config.mjs` or equivalent | Web lint configuration. |
| `badminton-mobile/app.config.js` | Dynamic Expo config and API URL injection. |
| `badminton-mobile/app.json` | Static Expo app configuration. |
| `tsconfig.json` files | TypeScript configuration per package. |

## Environment Variables

| Variable | Used By | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `badminton-web` | PostgreSQL/Neon connection string. |
| `JWT_SECRET` | `badminton-web` | Secret for signing and verifying JWT session tokens. |
| `NEXT_PUBLIC_APP_URL` | `badminton-web` | Public web app URL for links and deployment configuration. |
| `BADMINTON_API_URL` | `badminton-mobile` | REST API base URL, usually `http://localhost:3000/api` during local development. |

Do not commit real secrets. Use `.env.example` files or documentation examples for evaluators.

## Shared Code Strategy

Use `badminton-shared` when a rule is stable and needed by more than one app. Keep app-specific implementation in its owning package:

| Belongs In | Examples |
| --- | --- |
| `badminton-web` | Database access, Server Actions, REST handlers, Next.js pages, web-only components. |
| `badminton-mobile` | Expo screens, native storage, mobile components, mobile networking wrappers. |
| `badminton-shared` | Type definitions, status constants, validation rules, framework-neutral helpers. |

This keeps the monorepo modular while avoiding duplicated business logic.
