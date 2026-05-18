# Full Stack Apps with AI — Capstone Assessment

Date: 2026-05-18  
Project: Badminton Club Planner / badminton-planner  
Repository: badminton-planner  
Assessor: Codex

## Overall Score

| Area | Score | Max |
|---|---:|---:|
| GitHub Commits | 15 | 15 |
| GitHub Commit Days | 10 | 15 |
| Architecture | 4 | 5 |
| Backend | 4 | 5 |
| Database | 5 | 5 |
| Users and Roles | 4 | 5 |
| Scalability | 2 | 5 |
| Web App | 10 | 15 |
| Admin Panel | 2 | 5 |
| Mobile App | 14 | 15 |
| Deployment | 1 | 5 |
| Documentation | 3 | 5 |
| TOTAL | 74 | 100 |

Estimated current capstone score: **74 / 100**.

Bonus items reviewed but not added to the base score:

| Bonus Area | Status |
|---|---|
| File Storage | Not implemented |
| Automated Tests | Not implemented |
| Automated Backups | Not implemented |

## GitHub Commits — 15 / 15

### Evidence Found
- `git rev-list --count HEAD` reports **23 commits**.
- Recent commits show meaningful progression: initial Next.js app, Expo initialization, database schema, seed script, auth, dashboard, sessions, API work, mobile login, sessions, events, and UI refactoring.
- Examples: `e0865bd feat(database): initialize database schema and connection setup`, `9819f91 feat(api): implement authentication and session management endpoints`, `cef3e87 feat(sessions): implement session listing with loading and error handling`, `a5fd5c9 Refactor Sessions Screen and Add Event Card Component`.

### Missing / Weak Areas
- No issue for commit count itself.
- Some recent substantial work appears in the working tree and is not necessarily committed at assessment time.

### Why Points Were Deducted
- No points deducted. The criterion caps at 15, and the repository has more than 15 commits.

### Recommended Codex Prompt

```text
Inspect the current working tree and create a clean sequence of meaningful commits for the capstone project.
Group changes by feature area:
- mobile UI system
- mobile dashboard screens
- backend API changes
- documentation and assessment

Do not squash unrelated work together.
Before committing, run the available lint/build checks and include the results in commit messages where appropriate.
```

## GitHub Commit Days — 10 / 15

### Evidence Found
- `git log --date=short --pretty=format:%ad` shows commits on **2026-05-17** and **2026-05-18**.
- That is 2 distinct commit days.
- Official scoring is 5 points per commit day, capped at 15.

### Missing / Weak Areas
- Requirement expects commits on at least 3 different days for full score.
- Current history is concentrated across 2 days.

### Why Points Were Deducted
- Deducted 5 points because the project has commits on 2 days instead of 3 or more.

### Recommended Codex Prompt

```text
Help me plan a final capstone hardening day with small, meaningful improvements that can be committed separately:
- tests
- deployment docs
- admin panel improvements
- seed scalability
- README updates

Create a checklist of tasks that are safe to implement incrementally without rewriting the existing app.
```

## Architecture — 4 / 5

### Evidence Found
- Root `package.json` uses npm workspaces for `badminton-web` and `badminton-mobile`.
- `badminton-web/` is a Next.js app with `src/app`, `src/auth`, `src/db`, `src/lib`, and `src/components`.
- `badminton-mobile/` is an Expo React Native app using Expo Router.
- Mobile consumes the backend through REST endpoints using `BADMINTON_API_URL` and Bearer tokens.
- Business/session logic is partly separated into `badminton-web/src/lib/session-data.ts` and `badminton-web/src/lib/session-status.ts`.
- Auth code is centralized in `badminton-web/src/auth/*` and mobile auth is centralized in `badminton-mobile/src/auth/*`.
- Reusable web UI exists in `badminton-web/src/components/*`.
- Reusable mobile UI exists in `badminton-mobile/src/components/*` and `badminton-mobile/src/theme/mobile-theme.ts`.

### Missing / Weak Areas
- `badminton-shared/` exists but appears empty or unused based on `rg --files badminton-shared`.
- Some API routes still contain direct database access and business logic, especially event routes.
- There is no dedicated repository layer; DB access is mostly service-like modules plus route handlers.
- Folder names are project-specific (`badminton-web`, `badminton-mobile`) rather than the example `apps/web`, `apps/mobile`, but the workspace structure is still acceptable.

### Why Points Were Deducted
- Deducted 1 point for incomplete shared package usage and partially mixed route-handler/business/DB logic.

### Recommended Codex Prompt

```text
Refactor the backend architecture incrementally without changing behavior:
- move event query and registration business logic from app/api/events route handlers into src/lib/event-data.ts or src/services/events.ts
- keep route handlers thin: parse input, call service, return response
- extract shared API response/types used by mobile into badminton-shared
- update mobile imports to use shared framework-neutral types where appropriate

Preserve all current routes and API response shapes.
Run web and mobile lint/build after the refactor.
```

## Backend — 4 / 5

### Evidence Found
- Next.js backend exists under `badminton-web`.
- REST API routes exist:
  - `/api/auth/login`
  - `/api/docs`
  - `/api/sessions`
  - `/api/sessions/[id]`
  - `/api/sessions/[id]/attendance`
  - `/api/events`
  - `/api/events/[id]`
  - `/api/events/[id]/register`
  - `/api/events/[id]/cancel-registration`
- Database persistence uses Drizzle and Neon serverless driver in `badminton-web/src/db`.
- JWT auth exists in `badminton-web/src/auth/token.ts`.
- Bearer-token API authentication exists in `badminton-web/src/auth/api.ts`.
- Web session cookie handling exists in `badminton-web/src/auth/session.ts`.
- Protected page proxy exists in `badminton-web/src/proxy.ts`.
- Authorization evidence:
  - `getApiUser()` validates Bearer tokens.
  - Session detail checks group access.
  - Attendance update verifies linked player ownership.
  - Session cancel checks `canCancelSession`.
  - Event registration verifies linked player ownership when `playerId` is supplied.

### Missing / Weak Areas
- Event list/detail APIs are partly public and partly optional-auth; this is okay for public events but membership-only events are not modeled.
- Event route handlers still contain direct database and registration-state logic.
- No formal input validation library such as Zod; validation is manual.
- No refresh-token/session rotation flow; JWT cookie/API token is simple but acceptable for a capstone.

### Why Points Were Deducted
- Deducted 1 point for route handlers containing business/data logic and for limited production-grade validation/auth hardening.

### Recommended Codex Prompt

```text
Inspect the backend API implementation and upgrade it toward production-grade route architecture:
- add service functions for events, event registration, sessions, and attendance
- keep route handlers thin
- add reusable validation helpers or Zod schemas for request bodies and params
- preserve all current REST endpoints and response shapes
- keep server-side authorization checks in services
- ensure API errors remain stable: { error: { message } }

Run npm run lint --workspace badminton-web and npm run build --workspace badminton-web.
```

## Database — 5 / 5

### Evidence Found
- PostgreSQL/Drizzle config exists in `badminton-web/drizzle.config.ts`.
- Migration SQL is committed:
  - `badminton-web/drizzle/0000_tiresome_rictor.sql`
  - `badminton-web/drizzle/0001_eager_daimon_hellstrom.sql`
- Schema has more than 4 tables:
  - `users`
  - `players`
  - `venues`
  - `groups`
  - `group_members`
  - `sessions`
  - `session_attendance`
  - `session_comments`
  - `events`
  - `event_registrations`
- Relationships are defined with Drizzle `relations()`.
- Indexes and unique indexes exist for common query paths:
  - user email
  - player parent user
  - group venue
  - session group/date/venue/coach
  - attendance parent/session-player uniqueness
  - comments by session/user
  - events by date/venue
  - registrations by event/user/player
- Seed script exists in `badminton-web/src/db/seed.ts`.
- Neon compatibility is present through `@neondatabase/serverless`.

### Missing / Weak Areas
- Database design is strong for capstone requirements.
- Seed size is not large enough for scalability criterion, but the database criterion itself is satisfied.

### Why Points Were Deducted
- No points deducted. Internal table scoring would exceed 5, and the criterion is capped at 5.

### Recommended Codex Prompt

```text
Improve the database layer without changing product behavior:
- add comments in schema.ts explaining the main relationships
- add a docs/database.md file with an ERD-style textual overview
- verify generated migrations match schema
- add indexes for any remaining high-frequency filters discovered in API routes

Do not drop or rewrite existing tables.
Run drizzle generate only if schema changes are required.
```

## Users and Roles — 4 / 5

### Evidence Found
- Register flow exists in `badminton-web/src/auth/actions.ts` and `badminton-web/src/app/(auth)/register`.
- Login/logout exist for the web app through auth actions/session cookie.
- Mobile login/logout exists through `badminton-mobile/src/auth/auth-context.tsx`.
- Password hashing uses `bcrypt`.
- JWT generation and verification use `jose` in `badminton-web/src/auth/token.ts`.
- Roles exist in schema: `admin`, `manager`, `coach`, `parent`.
- Group member roles exist: `manager`, `coach`, `parent`, `player`.
- Demo seed includes admin, manager, coach, parent users.
- Server-side authorization exists for attendance, session access, and manager/coach/admin session cancellation.

### Missing / Weak Areas
- No dedicated admin-only user/role management UI.
- Registration always creates a `parent` role; there is no UI to promote/manage users.
- No profile/settings page.
- No refresh-token flow or explicit token revocation beyond cookie clearing/local logout.

### Why Points Were Deducted
- Deducted 1 point because roles/auth exist, but admin/special-role management is limited and not surfaced as a complete user-management workflow.

### Recommended Codex Prompt

```text
Add production-quality role management without rewriting auth:
- create an admin-only /admin/users page
- list users with role badges
- allow admins to change user roles among parent, coach, manager, admin
- enforce admin-only access server-side
- add service functions for user lookup and role update
- add validation and stable error handling
- update navigation so only admins see the admin area

Preserve existing login/register/session behavior.
```

## Scalability — 2 / 5

### Evidence Found
- API pagination parameters exist in `badminton-web/src/auth/api.ts` via `parsePage()`.
- Sessions API returns `paging` with `page`, `pageSize`, `total`, `hasMore`.
- Events API returns `paging`.
- Mobile sessions and events screens implement paged infinite loading.
- DB indexes exist on many important foreign keys and date fields.

### Missing / Weak Areas
- Seed data is small:
  - 27 users
  - 30 players
  - 4 groups
  - 6 sessions
  - 4 events
- Requirement asks for at least **10,000 seeded DB records**; this is not met.
- Sessions/events APIs load all matching rows and then use `.slice(offset, offset + pageSize)` in memory. That is not production-grade for large datasets.
- No cursor pagination or database-level `limit/offset` pagination in the main list APIs.
- No performance tests or load-oriented seed scripts.

### Why Points Were Deducted
- Deducted 3 points for not meeting the 10,000-record seed requirement and for in-memory pagination of potentially large result sets.

### Recommended Codex Prompt

```text
Upgrade scalability for the capstone:
- add a separate large seed script that creates at least 10,000 realistic records across users, players, groups, sessions, attendance, comments, events, and registrations
- change /api/sessions and /api/events to use database-level pagination with limit/offset or cursor pagination
- return total counts using efficient count queries
- keep the current response shape with data and paging
- ensure existing mobile pagination still works
- document how to run the large seed safely

Run web lint/build and avoid breaking the demo seed script.
```

## Web App — 10 / 15

### Evidence Found
- Next.js web app exists.
- Tailwind CSS is used.
- Public pages:
  - home
  - venues
  - events
  - login
  - register
- Protected pages:
  - dashboard
  - session detail
- API docs page exists under `/api/docs`.
- Modern UI components exist:
  - `dashboard-session-card.tsx`
  - `session-badges.tsx`
  - `stat-card.tsx`
  - `ui/surfaces.tsx`
  - `site-header.tsx`
- Dashboard shows active/archive sessions, attendance metrics, events, and session cards.
- Session details page includes attendance form, member attendance list, comments, share button, and cancel session action.
- Responsive Tailwind classes are visible across pages.

### Missing / Weak Areas
- The requirement gives a minimum of 10 screens/pages/popups. The web app has roughly 7 main page screens, depending on whether API docs/forms are counted.
- README describes groups, group details, venues management, user/account, and admin features, but actual web routes for full CRUD management are not present.
- No dedicated groups list/detail management UI.
- No venue management CRUD UI.
- No event management CRUD UI.
- No profile/settings page.
- No admin users page.

### Why Points Were Deducted
- Deducted 5 points because the web app is polished but does not yet implement enough full management screens to satisfy the 10-screen/admin/management breadth expected by the capstone.

### Recommended Codex Prompt

```text
Expand the Next.js web app to satisfy the capstone screen-count and management requirements:
- add protected /groups list and /groups/[id] details pages
- add manager-only create/edit group workflows
- add venue management pages for managers/admins
- add event management pages for managers/admins
- add account/profile page
- reuse existing UI components and Tailwind design direction
- enforce authorization server-side
- keep data access in service functions

Do not rewrite existing dashboard/session pages.
```

## Admin Panel — 2 / 5

### Evidence Found
- `admin` role exists in the database enum and seed data.
- `getAccessibleGroupIds()` gives admins access to all groups.
- `canManageSession()` allows admins to manage/cancel sessions.
- Dashboard is protected and role-aware to a limited extent through backend service functions.

### Missing / Weak Areas
- No dedicated `/admin` route.
- No admin-only dashboard/panel.
- No user management UI.
- No role management UI.
- No protected admin route guard beyond scattered service checks.
- No admin CRUD for groups, venues, sessions, or events.

### Why Points Were Deducted
- Deducted 3 points because there is an admin role and some admin behavior, but no complete admin panel or user/role management feature.

### Recommended Codex Prompt

```text
Implement a focused admin panel for the capstone:
- add /admin protected route
- only users with role admin may access it
- show summary cards for users, groups, sessions, events
- add a user table with role badges
- allow changing a user's role with server-side validation
- include links to management pages for groups, venues, sessions, and events
- add tests or at least validation checks for non-admin access

Keep the UI consistent with the existing web dashboard design.
```

## Mobile App — 14 / 15

### Evidence Found
- Expo app exists in `badminton-mobile`.
- Expo Router is used.
- Mobile screens/routes:
  - home
  - login
  - sessions
  - session details
  - events
  - event details
  - layout/protected navigation
- Mobile connects to REST backend through `badminton-mobile/src/lib/api.ts`.
- API URL is environment-based through `.env` and `app.config.js`.
- Bearer token authentication is centralized in `badminton-mobile/src/auth/auth-context.tsx`.
- Token storage handles native SecureStore and web localStorage fallback.
- Mobile session list supports paging, refresh, loading, error, empty states.
- Mobile event list supports paging, refresh, loading, error, empty states.
- Session details supports attendance update, note editing, comments, and session info.
- Event details supports register/cancel registration and refresh after action.
- A refreshed mobile UI system exists with reusable cards, badges, stat tiles, bottom nav, and theme.

### Missing / Weak Areas
- No mobile register screen.
- No mobile group list/group detail screen.
- No account/profile screen.
- Some navigation is custom rather than native tab route groups, though it is functional.
- Mobile relies on API contracts but duplicates some TypeScript types locally instead of sharing them.

### Why Points Were Deducted
- Deducted 1 point for missing mobile register/groups/account coverage and limited shared type reuse. The core mobile capstone requirements are otherwise very strong.

### Recommended Codex Prompt

```text
Round out the Expo mobile app for the capstone:
- add a mobile register screen or clearly link users to web registration
- add My Groups list and Group Details screens
- add an Account screen with user info and logout
- move repeated API response types into badminton-shared and import them in mobile
- keep the current mobile UI theme and bottom navigation
- preserve existing auth/session/event functionality

Run npm run lint --workspace badminton-mobile and npm run build --workspace badminton-mobile.
```

## Deployment — 1 / 5

### Evidence Found
- `badminton-web/README.md` has default Next.js Vercel deployment text.
- `badminton-mobile` has an Expo export build script.
- Environment-dependent code exists:
  - `DATABASE_URL` in Drizzle config and DB connection.
  - `JWT_SECRET` in auth token code.
  - `BADMINTON_API_URL` in mobile config.
- Mobile export has been shown to build locally in prior checks.

### Missing / Weak Areas
- No production deployment URL found.
- No Vercel project config found.
- No Netlify/Fly/Render/Railway config found.
- No Expo deployment/EAS config found.
- No `.env.example` files found.
- No documented production env var setup.
- No public verification that apps are working live.

### Why Points Were Deducted
- Deducted 4 points because deployment is not verifiable from the repository. Local build capability exists, but official requirement asks for live deployed apps and production environment configuration.

### Recommended Codex Prompt

```text
Prepare deployment for the capstone:
- add .env.example files for root, badminton-web, and badminton-mobile
- document required production variables: DATABASE_URL, JWT_SECRET, BADMINTON_API_URL
- add Vercel deployment notes for the Next.js app
- add Expo/EAS or Expo web export deployment notes for the mobile app
- add production URLs to README once deployed
- verify the deployed API docs, web app, and mobile export work publicly

Do not commit real secrets.
```

## Documentation — 3 / 5

### Evidence Found
- Root `README.md` has a strong project description, roles, user flows, web/mobile app scope, and demo-data safety notes.
- Root `AGENTS.md` documents architecture, stack, folder structure, backend/database/auth guidelines.
- App-specific `AGENTS.md` files exist for web and mobile.
- API docs endpoint exists at `/api/docs`.
- Seed script includes demo credentials such as `manager@badminton.test` / `pass123`, and API docs mention one demo login.

### Missing / Weak Areas
- README lacks a clear local setup guide with exact commands.
- README lacks database setup and migration instructions.
- README lacks a database schema explanation or ERD.
- README lacks deployment guide with env vars.
- README lacks full demo credentials table.
- `badminton-web/README.md` is still mostly default Next.js scaffold text.
- `badminton-mobile/README.md` was not verified as complete and appears scaffold-level from file presence.

### Why Points Were Deducted
- Deducted 2 points because documentation is conceptually good but incomplete for setup/deployment/schema/demo operations.

### Recommended Codex Prompt

```text
Upgrade capstone documentation:
- rewrite root README with project overview, architecture, repo structure, local setup, database setup, migrations, seed commands, mobile setup, API docs, and deployment
- add a demo credentials table for admin, manager, coach, parent users
- add docs/database.md explaining tables and relationships
- add docs/api.md summarizing REST endpoints and auth
- replace scaffold README content in badminton-web and badminton-mobile with project-specific notes
- include screenshots or textual screen map if images are unavailable

Do not include real secrets or real child/member data.
```

## File Storage Bonus — Not implemented

### Evidence Found
- `photoUrl` fields exist in the schema, but no upload/download API, object storage integration, signed URL generation, or file handling was found.
- Search did not find R2/S3/blob/storage/upload implementation.

### Missing / Weak Areas
- No Cloudflare R2/S3/equivalent setup.
- No upload UI.
- No signed URL flow.

### Recommended Codex Prompt

```text
Add optional file storage bonus support:
- integrate Cloudflare R2 or S3-compatible storage
- add secure avatar/photo upload for users or venues
- store only object keys/URLs in the database
- validate file type and size
- generate signed upload/download URLs
- document required env vars and setup

Keep this isolated so the core app still works without storage in local demo mode.
```

## Automated Tests Bonus — Not implemented

### Evidence Found
- No Vitest/Jest/Playwright/Cypress test files found.
- No `.github/workflows` directory found.
- Package scripts do not include test commands.

### Missing / Weak Areas
- No unit tests.
- No integration tests for API route/service behavior.
- No E2E tests.
- No CI automation.

### Recommended Codex Prompt

```text
Add automated tests and CI:
- add Vitest for backend service/helper tests
- test session status logic, auth validation helpers, and API error helpers
- add Playwright smoke tests for login, dashboard, sessions, and events
- add a GitHub Actions workflow running lint, build, and tests
- keep tests deterministic and avoid requiring production secrets

Start with a small but meaningful test suite rather than trying to cover everything.
```

## Automated Backups Bonus — Not implemented

### Evidence Found
- No backup scripts found.
- No scheduled GitHub Actions workflows found.
- No retention-policy logic found.

### Missing / Weak Areas
- No automated database backup.
- No file storage backup.
- No scheduled execution.
- No restore documentation.

### Recommended Codex Prompt

```text
Add an optional automated backup workflow:
- create a scripts/backup-db script that exports the Postgres database safely
- add a GitHub Actions scheduled workflow
- upload backup artifacts to a secure storage target
- include retention settings
- document restore steps
- ensure secrets are referenced through GitHub Actions secrets, never committed

Keep this as an optional production operations feature.
```

## Highest-Impact Next Steps

1. Add a real admin panel with user/role management. This improves Admin Panel, Users/Roles, Web App, and Architecture.
2. Add large-scale seed data and DB-level pagination. This directly improves Scalability.
3. Add deployment docs, `.env.example`, and public deployed URLs. This directly improves Deployment.
4. Expand web management screens for groups, venues, events, and account/profile. This improves Web App and Admin Panel.
5. Add tests and CI. This does not affect base score directly under the provided criteria, but it strongly improves project credibility and bonus readiness.
